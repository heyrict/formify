import json
import re

from pybars import Compiler

BLANK_LINE_RE = re.compile(r'\n\s*\n')


def _eq(this, options, a, b):
    if a == b:
        return options['fn'](this)
    return []


def _neq(this, options, a, *args):
    for b in args:
        if a == b:
            return []
    return options['fn'](this)


helpers = {
    "eq": _eq,
    "neq": _neq,
}

cp = Compiler()

with open("./config.json") as f, open("./default-config.json") as df:
    user_config = json.loads(f.read())
    default_config = json.loads(df.read())
    config = {**default_config, **user_config}
    template = config['template']

with open("./templates/" + template + "/index.js.hbs") as f:
    js_index = cp.compile(f.read())

with open("./templates/" + template + "/client.html.hbs") as f:
    html_client = cp.compile(f.read())

with open("./i18n/" + config['locale'] + ".json") as f:
    i18n = json.loads(f.read())

variables = {
    "i18n": i18n,
    **config,
}

with open("./static/client.html", "w") as f:
    f.write(BLANK_LINE_RE.sub("\n", html_client(variables, helpers=helpers)))

with open("./static/index.js", "w") as f:
    f.write(BLANK_LINE_RE.sub("\n", js_index(variables, helpers=helpers)))
