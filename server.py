import asyncio
import json
import os
from crypt import Bcrypt
from datetime import datetime

import numpy as np
import pandas as pd

import cherrypy


def convert(o):
    if isinstance(o, np.int64):
        return int(o)
    if isinstance(o, np.float64):
        return float(o)


class HomePage(object):
    @cherrypy.expose
    def index(self):
        return open('./static/client.html')


@cherrypy.expose
class APIv1(object):
    def __init__(self):
        with open("./config.json") as f, open("./default-config.json") as df:
            user_config = json.loads(f.read())
            default_config = json.loads(df.read())
            self.config = {**default_config, **user_config}
        self.inputFile = self.config['inputFile']
        self.outputFile = self.config['outputFile']
        self.fieldNames = [self.config['idField']
                           ] + [f['fieldName'] for f in self.config['fields']]
        self.fieldAliases = ['id'] + [
            f['fieldAlias'] for f in self.config['fields']
        ]
        if self.config['updateTime']:
            self.fieldNames.append("updatedAt")

        self.ntoa = dict(zip(self.fieldNames, self.fieldAliases))
        self.aton = dict(zip(self.fieldAliases, self.fieldNames))
        self.ntoa[self.config['idField']] = 'id'
        self.aton['id'] = self.config['idField']

        self.inputDf = pd.read_excel(self.inputFile)
        if os.path.exists(self.outputFile):
            self.outputDf = pd.read_excel(self.outputFile)
        else:
            self.outputDf = pd.DataFrame(columns=self.fieldNames)
        self.allColumns = list(
            set(self.inputDf.columns) | set(self.outputDf.columns))

        idField = self.config['idField']
        self.inputDf.set_index(idField, inplace=True)
        self.outputDf.set_index(idField, inplace=True)
        self.inputDf.index = self.inputDf.index.astype(str)
        self.outputDf.index = self.outputDf.index.astype(str)

    @cherrypy.tools.accept(media='application/json')
    @cherrypy.tools.json_in()
    def POST(self):
        data = cherrypy.request.json
        action = data['action']
        variables = data['variables']

        if action == "AUTH_STUDENT_QUERY":
            try:
                res = self.authStudentQuery(variables)
            except Exception as e:
                res = self.done(None, [{
                    "type": "Exception",
                    "message": str(e),
                }])
            return res

        if action == "UPDATE_STUDENT_MUTATION":
            try:
                res = self.updateStudentMutation(variables)
            except Exception as e:
                res = self.done(None, [{
                    "type": "Exception",
                    "message": str(e),
                }])
            return res

    def authStudentQuery(self, data):
        pwField = self.config['passwordField']
        inputDfAlias = self.inputDf.rename(self.ntoa, axis=1)
        outputDfAlias = self.outputDf.rename(self.ntoa, axis=1)
        outputFields = self.ntoa.values()
        errors = []

        if data['id'] in inputDfAlias.index:
            student = inputDfAlias.loc[data['id']].copy()
            if data['id'] in outputDfAlias.index:  # If record exists, combine
                student = outputDfAlias.loc[data['id']].combine_first(student)
            student['id'] = data['id']
        else:
            errors.append({"type": "NotExistError", "message": "ID not exist"})
            return self.done(None, errors)

        if (self.checkPassword(data['pw'], student[pwField])):
            # TODO: Simplify Series -> json -> dict -> json procedure
            data = json.loads(student.reindex(outputFields).to_json())
            return self.done(data)
        else:
            errors.append({
                "type": "PasswordError",
                "message": "WrongPassword"
            })
            return self.done(None, errors)

    def updateStudentMutation(self, data):
        ser = pd.Series(data)
        ser.name = ser.id
        del ser['id']
        if self.config['updateTime']:
            ser['updatedAt'] = datetime.now().isoformat()

        if ser.name not in self.inputDf.index:
            return self.done(None, [{
                "type": "NotExistError",
                "message": "ID not exist",
            }])

        if ser.name in self.outputDf.index:
            self.outputDf.loc[ser.name] = ser.rename(self.aton)
        else:
            self.outputDf = self.outputDf.append(ser.rename(self.aton))

        self.save_output()
        return self.done(data)

    def checkPassword(self, pwraw, pwenc):
        encryption = self.config['encryption']
        if encryption == 'none':
            return pwraw == pwenc
        if encryption == 'bcrypt':
            return Bcrypt.check_password(pwraw, pwenc)

    def done(self, data, errors=None):
        return json.dumps(
            {
                "data": data,
                "errors": errors,
            }, default=convert).encode("utf-8")

    def save_output(self):
        if (self.config['mergeInput']):
            outputIndex = self.inputDf.index
            outputDf = self.outputDf.reindex(
                index=outputIndex, columns=self.allColumns)
            inputDf = self.inputDf.reindex(
                index=outputIndex, columns=self.allColumns)
            output = outputDf.combine_first(inputDf)
            output.to_excel(self.outputFile)
        else:
            self.outputDf.to_excel(self.outputFile)


if __name__ == '__main__':
    conf = {
        '/': {
            'tools.staticdir.root': os.path.abspath(os.getcwd()),
        },
        '/apiv1': {
            'request.dispatch':
            cherrypy.dispatch.MethodDispatcher(),
            'tools.response_headers.on':
            True,
            'tools.response_headers.headers': [('Content-Type',
                                                'application/json')],
            'tools.encode.on':
            True,
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': './static',
        },
    }
    webapp = HomePage()
    webapp.apiv1 = APIv1()
    cherrypy.quickstart(webapp, '/', conf)
