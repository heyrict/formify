const { Formik, Form } = window.Formik;
const SERVER_ADDR = "http://165.227.21.196:4000/graphql";
//const SERVER_ADDR = "http://localhost:4000/graphql";
const STUDENT_FRAGMENT = `
fragment StudentDetail on Student {
  id
  name
  gender
  class
  ethnic
  uid
  politicalStatus
  source
  domitary
  bed
  phone
  birthplace
  home
  memo
  height
  qq
  skills
  hobby
  dName
  dBirthday
  dPoliticalStatus
  dJob
  dPhone
  mName
  mBirthday
  mPoliticalStatus
  mJob
  mPhone
  singleParent
  jobSUGrade1
  jobSUGrade2
  jobSUGrade3
  jobSquadGrade1
  jobSquadGrade2
}`;
const AUTH_STUDENT_QUERY = `
query($id: String!, $pw: String!) {
  authStudent(id: $id, pw: $pw) {
    ...StudentDetail
  }
}
${STUDENT_FRAGMENT}
`;
const UPDATE_STUDENT_MUTATION = `
mutation(
  $id: Int!
  $name: String
  $gender: String
  $class: String
  $ethnic: String
  $uid: String
  $politicalStatus: String
  $source: String
  $domitary: String
  $bed: Int
  $phone: Float
  $birthplace: String
  $home: String
  $memo: String
  $height: Float
  $qq: Float
  $skills: String
  $hobby: String
  $dName: String
  $dBirthday: String
  $dPoliticalStatus: String
  $dJob: String
  $dPhone: Float
  $mName: String
  $mBirthday: String
  $mPoliticalStatus: String
  $mJob: String
  $mPhone: Float
  $singleParent: String
  $jobSUGrade1: String
  $jobSUGrade2: String
  $jobSUGrade3: String
  $jobSquadGrade1: String
  $jobSquadGrade2: String
){
  updateStudent (
    id: $id
    name: $name
    gender: $gender
    class: $class
    ethnic: $ethnic
    uid: $uid
    politicalStatus: $politicalStatus
    source: $source
    domitary: $domitary
    bed: $bed
    phone: $phone
    birthplace: $birthplace
    home: $home
    memo: $memo
    height: $height
    qq: $qq
    skills: $skills
    hobby: $hobby
    dName: $dName
    dBirthday: $dBirthday
    dPoliticalStatus: $dPoliticalStatus
    dJob: $dJob
    dPhone: $dPhone
    mName: $mName
    mBirthday: $mBirthday
    mPoliticalStatus: $mPoliticalStatus
    mJob: $mJob
    mPhone: $mPhone
    singleParent: $singleParent
    jobSUGrade1: $jobSUGrade1
    jobSUGrade2: $jobSUGrade2
    jobSUGrade3: $jobSUGrade3
    jobSquadGrade1: $jobSquadGrade1
    jobSquadGrade2: $jobSquadGrade2
  ) {
    ...StudentDetail
  }
}
${STUDENT_FRAGMENT}
`;

function get_data(query, variables) {
  return fetch(SERVER_ADDR, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
}

function getClassName(e) {
  if (e) { return "form-control is-invalid"; }
  return "form-control";
}

function LoginPanel(props) {
  return (
    <Formik
      initialValues={{ id: "", pw: "" }}
      validate={function(values){
        let errors = {};
        if (!values.id) {
          errors.id = "请输入学号";
        } else if (!/\d+/.test(values.id)) {
          errors.id = "学号包含非法字符";
        }
        if (!values.pw ) {
          errors.pw = "请输入密码";
        }
        if (values.pw.length !== 6) {
          errors.pw = "密码错误";
        }

        return errors;
      }}
      onSubmit={function(values, { setSubmitting, setErrors }){
        get_data(AUTH_STUDENT_QUERY, values)
          .then(function(r) { return r.json()})
          .then(function(data) {
            if (data.errors) {
              setErrors({ pw: `错误:${JSON.stringify(data.errors.map(function(e){ return e.message }))}` });
            }
            if (data.data.authStudent === null) {
              setErrors({ pw: "密码错误" });
            } else {
              props.setData(data.data.authStudent);
              props.changeStage(1);
            }
            setSubmitting(false);
          });
      }}
    >
      {function({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }){
        return (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="id">学号</label>
              <input type="text" className={getClassName(touched.id && errors.id)} name="id" value={values.id} onChange={handleChange} />
              {errors.id && touched.id && <div className="invalid-feedback">{errors.id}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="pw">密码</label>
              <input type="password" className={getClassName(touched.pw && errors.pw)} name="pw" value={values.pw} onChange={handleChange} />
              {errors.pw && touched.pw && <div className="invalid-feedback">{errors.pw}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "登录中...请稍候" : "登录"}</button>
          </form>
        );
      }}
    </Formik>
  );
}

function EditPanel(props) {
  return (
    <Formik
      initialValues={props.data}
      validate={function(values){
        let errors = {};
        Object.entries(values).forEach(function([k, v]) {
          if (k !== "height" && k !== "memo" && k !== "domitary" && k !== "bed" && k !== "hobby" && k !== "skills" && !/^jobS/.test(k) && k[0] !== "m" && k[0] !== "d") {
            if (v === null) {
              errors = Object.assign({}, errors, {[k]: "此项目为必填项"});
              return;
            }
          }
          if (k == "bed" || k == "phone" || k == "dPhone" || k == "mPhone") {
            if (v !== null && !/^[0-9]*$/.test(v)) {
              errors = Object.assign({}, errors, {[k]: "此项目不合法：包含除数字以外的字符"});
            }
          }
          if (k == "dBirthday" || k == "mBirthday") {
            if (v !== null && !/^[0-9\-+:. ]*$/.test(v)) {
              errors = Object.assign({}, errors, {[k]: "此项目不合法：非日期格式"});
            }
          }
        });
        if (!/^[0-9\-]*$/.test(values.domitary)) {
          errors.domitary = "宿舍请按提示规范填写";
        }
        return errors;
      }}
      onSubmit={function(values, { setSubmitting, setErrors }){
        console.log("submitting");
        const postValues = Object.assign({}, values, {
          id: parseInt(values.id, 10),
          bed: parseInt(values.bed, 10),
          qq: parseFloat(values.qq, 10),
          phone: parseFloat(values.phone, 10),
          dPhone: parseFloat(values.dPhone, 10),
          mPhone: parseFloat(values.mPhone, 10),
        });
        get_data(UPDATE_STUDENT_MUTATION, postValues)
          .then(function(r){ return r.json() })
          .then(function(data) {
            if (data.errors) {
              setErrors({jobSUGrade3: `错误：${JSON.stringify(data.errors.map(function(e){ return e.message; }))}`});
              return data;
            }
            props.changeStage(2);
          });
        setSubmitting(false);
      }}
    >
      {function({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }){
        return (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="id">学号</label>
              <input type="text" className="form-control" name="id" value={values.id} readonly />
            </div>
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <input type="text" className={getClassName(touched.name && errors.name)} name="name" value={values.name} onChange={handleChange} />
              {errors.name && touched.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="gender">性别</label>
              <select className={getClassName(touched.gender && errors.gender)} name="gender" value={values.gender} onChange={handleChange}>
                <option>请选择</option>
                <option value="女">女</option>
                <option value="男">男</option>
                <option value="其他">其他</option>
              </select>
              {errors.gender && touched.gender && <div className="invalid-feedback">{errors.gender}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="class">班级</label>
              <select className={getClassName(touched.class && errors.class)} name="class" value={values.class} onChange={handleChange}>
                <option>请选择</option>
                <option value="五临1班">五临1班</option>
                <option value="五临2班">五临2班</option>
                <option value="五临3班">五临3班</option>
                <option value="五临4班">五临4班</option>
                <option value="五临5班">五临5班</option>
                <option value="五临6班">五临6班</option>
                <option value="五临7班">五临7班</option>
                <option value="五临8班">五临8班</option>
                <option value="五临9班">五临9班</option>
                <option value="五临10班">五临10班</option>
                <option value="五临11班">五临11班</option>
                <option value="五临12班">五临12班</option>
                <option value="五临13班">五临13班</option>
                <option value="五临14班">五临14班</option>
                <option value="医检班">医检班</option>
              </select>
              {errors.class && touched.class && <div className="invalid-feedback">{errors.class}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="ethnic">民族</label>
              <input type="text" className={getClassName(touched.ethnic && errors.ethnic)} name="ethnic" value={values.ethnic} onChange={handleChange} />
              {errors.ethnic && touched.ethnic && <div className="invalid-feedback">{errors.ethnic}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="uid">身份证号</label>
              <input type="text" className={getClassName(touched.uid && errors.uid)} name="uid" value={values.uid} onChange={handleChange} />
              {errors.uid && touched.uid && <div className="invalid-feedback">{errors.uid}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="politicalStatus">政治面貌</label>
              <input type="text" className={getClassName(touched.politicalStatus && errors.politicalStatus)} name="politicalStatus" value={values.politicalStatus} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">如：群众、共青团员、预备党员、共产党员</small>
              {errors.politicalStatus && touched.politicalStatus && <div className="invalid-feedback">{errors.politicalStatus}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="source">生源地</label>
              <input type="text" className={getClassName(touched.source && errors.source)} name="source" value={values.source} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">省+市（直辖市）。如：上海、江苏南京</small>
              {errors.source && touched.source && <div className="invalid-feedback">{errors.source}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="domitary">宿舍</label>
              <input type="text" className={getClassName(touched.domitary && errors.domitary)} name="domitary" value={values.domitary} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">宿舍请按如下方式填写：<br />其他宿舍: 01-101<br />06栋: 06-1-101-1</small>
              {errors.domitary && touched.domitary && <div className="invalid-feedback">{errors.domitary}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="bed">床号</label>
              <input type="text" className={getClassName(touched.bed && errors.bed)} name="bed" value={values.bed} onChange={handleChange} />
              {errors.bed && touched.bed && <div className="invalid-feedback">{errors.bed}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">学生手机号码</label>
              <input type="text" className={getClassName(touched.phone && errors.phone)} name="phone" value={values.phone} onChange={handleChange} />
              {errors.phone && touched.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="birthplace">籍贯</label>
              <input type="text" className={getClassName(touched.birthplace && errors.birthplace)} name="birthplace" value={values.birthplace} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">省+市（直辖市）。如：上海、江苏南京</small>
              {errors.birthplace && touched.birthplace && <div className="invalid-feedback">{errors.birthplace}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="home">家庭地址</label>
              <input type="text" className={getClassName(touched.home && errors.home)} name="home" value={values.home} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">尽可能精确到户</small>
              {errors.home && touched.home && <div className="invalid-feedback">{errors.home}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="qq">QQ</label>
              <input type="text" className={getClassName(touched.qq && errors.qq)} name="qq" value={values.qq} onChange={handleChange} />
              {errors.qq && touched.qq && <div className="invalid-feedback">{errors.qq}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="skills">特长</label>
              <input type="text" className={getClassName(touched.skills && errors.skills)} name="skills" value={values.skills} onChange={handleChange} />
              {errors.skills && touched.skills && <div className="invalid-feedback">{errors.skills}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="hobby">兴趣爱好</label>
              <input type="text" className={getClassName(touched.hobby && errors.hobby)} name="hobby" value={values.hobby} onChange={handleChange} />
              {errors.hobby && touched.hobby && <div className="invalid-feedback">{errors.hobby}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="dName">父亲姓名</label>
              <input type="text" className={getClassName(touched.dName && errors.dName)} name="dName" value={values.dName} onChange={handleChange} />
              {errors.dName && touched.dName && <div className="invalid-feedback">{errors.dName}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="dBirthday">父亲出生年份</label>
              <input type="text" className={getClassName(touched.dBirthday && errors.dBirthday)} name="dBirthday" value={values.dBirthday} onChange={handleChange} />
              {errors.dBirthday && touched.dBirthday && <div className="invalid-feedback">{errors.dBirthday}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="dPoliticalStatus">父亲政治面貌</label>
              <input type="text" className={getClassName(touched.dPoliticalStatus && errors.dPoliticalStatus)} name="dPoliticalStatus" value={values.dPoliticalStatus} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">如：群众、共青团员、预备党员、共产党员</small>
              {errors.dPoliticalStatus && touched.dPoliticalStatus && <div className="invalid-feedback">{errors.dPoliticalStatus}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="dJob">父亲工作单位及职务</label>
              <input type="text" className={getClassName(touched.dJob && errors.dJob)} name="dJob" value={values.dJob} onChange={handleChange} />
              {errors.dJob && touched.dJob && <div className="invalid-feedback">{errors.dJob}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="dPhone">父亲手机号码</label>
              <input type="text" className={getClassName(touched.dPhone && errors.dPhone)} name="dPhone" value={values.dPhone} onChange={handleChange} />
              {errors.dPhone && touched.dPhone && <div className="invalid-feedback">{errors.dPhone}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="mName">母亲姓名</label>
              <input type="text" className={getClassName(touched.mName && errors.mName)} name="mName" value={values.mName} onChange={handleChange} />
              {errors.mName && touched.mName && <div className="invalid-feedback">{errors.mName}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="mBirthday">母亲出生年份</label>
              <input type="text" className={getClassName(touched.mBirthday && errors.mBirthday)} name="mBirthday" value={values.mBirthday} onChange={handleChange} />
              {errors.mBirthday && touched.mBirthday && <div className="invalid-feedback">{errors.mBirthday}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="mPoliticalStatus">母亲政治面貌</label>
              <input type="text" className={getClassName(touched.mPoliticalStatus && errors.mPoliticalStatus)} name="mPoliticalStatus" value={values.mPoliticalStatus} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">如：群众、共青团员、预备党员、共产党员</small>
              {errors.mPoliticalStatus && touched.mPoliticalStatus && <div className="invalid-feedback">{errors.mPoliticalStatus}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="mJob">母亲工作单位及职务</label>
              <input type="text" className={getClassName(touched.mJob && errors.mJob)} name="mJob" value={values.mJob} onChange={handleChange} />
              {errors.mJob && touched.mJob && <div className="invalid-feedback">{errors.mJob}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="mPhone">母亲手机号码</label>
              <input type="text" className={getClassName(touched.mPhone && errors.mPhone)} name="mPhone" value={values.mPhone} onChange={handleChange} />
              {errors.mPhone && touched.mPhone && <div className="invalid-feedback">{errors.mPhone}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="singleParent">单亲</label>
              <select className={getClassName(touched.singleParent && errors.singleParent)} name="singleParent" value={values.singleParent} onChange={handleChange}>
                <option>请选择</option>
                <option value="否">否</option>
                <option value="是">是</option>
                <option value="是（已故）">是（已故）</option>
              </select>
              {errors.singleParent && touched.singleParent && <div className="invalid-feedback">{errors.singleParent}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="jobSquadGrade1">2016至2017学年班委任职</label>
              <input type="text" className={getClassName(touched.jobSquadGrade1 && errors.jobSquadGrade1)} name="jobSquadGrade1" value={values.jobSquadGrade1} onChange={handleChange} />
              {errors.jobSquadGrade1 && touched.jobSquadGrade1 && <div className="invalid-feedback">{errors.jobSquadGrade1}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="jobSquadGrade2">2017至2018学年班委任职</label>
              <input type="text" className={getClassName(touched.jobSquadGrade2 && errors.jobSquadGrade2)} name="jobSquadGrade2" value={values.jobSquadGrade2} onChange={handleChange} />
              {errors.jobSquadGrade2 && touched.jobSquadGrade2 && <div className="invalid-feedback">{errors.jobSquadGrade2}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="jobSUGrade1">2016至2017学年学生会任职</label>
              <input type="text" className={getClassName(touched.jobSUGrade1 && errors.jobSUGrade1)} name="jobSUGrade1" value={values.jobSUGrade1} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">仅2016级团总支学生会任职，不包括校学生会及院学生会任职。如：自律部干事。</small>
              {errors.jobSUGrade1 && touched.jobSUGrade1 && <div className="invalid-feedback">{errors.jobSUGrade1}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="jobSUGrade2">2017至2018学年学生会任职</label>
              <input type="text" className={getClassName(touched.jobSUGrade2 && errors.jobSUGrade2)} name="jobSUGrade2" value={values.jobSUGrade2} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">仅2016级团总支学生会任职，不包括校学生会及院学生会任职。如：自律部干事。</small>
              {errors.jobSUGrade2 && touched.jobSUGrade2 && <div className="invalid-feedback">{errors.jobSUGrade2}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="jobSUGrade3">2018至2019学年任职情况</label>
              <input type="text" className={getClassName(touched.jobSUGrade3 && errors.jobSUGrade3)} name="jobSUGrade3" value={values.jobSUGrade3} onChange={handleChange} />
              <small id="domitaryHelp" class="form-text text-muted">当前任职情况，包括校学生会、院学生会及学工处各部门任职。请填写完整。如：南京医科大学校学生会主席。</small>
              {errors.jobSUGrade3 && touched.jobSUGrade3 && <div className="invalid-feedback">{errors.jobSUGrade3}</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>确认</button>
          </form>
        );
      }}
    </Formik>
  );
}

function Thank(props) {
  return (
    <div>
      <h1>
        提交成功
      </h1>
      <button className="btn btn-primary" onClick={function() {props.changeStage(0);}}>点此返回</button>
    </div>
  );
}

class Nav extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      stage: 0,
      data: null,
    }
  }
  changeStage(stage) {
    this.setState({ stage });
  }
  setData(data) {
    this.setState({ data });
  }
  render() {
    return (
      <div className="container-fluid">
        <div className="jumbotron">
          <h2 className="header">南京医科大学 2016 级团总支学生会 - 成员信息核对</h2>
        </div>
        {this.state.stage === 0 && (
          <LoginPanel changeStage={this.changeStage.bind(this)} setData={this.setData.bind(this)} />
        )}
        {this.state.stage === 1 && (
          <EditPanel data={this.state.data} changeStage={this.changeStage.bind(this)} setData={this.setData.bind(this)} />
        )}
        {this.state.stage === 2 && (
          <Thank changeStage={this.changeStage.bind(this)} />
        )}
      </div>
    );
  }
}

ReactDOM.render(
  <Nav />,
  document.getElementById('root')
);
