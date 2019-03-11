const { Formik, Form } = window.Formik;
const SERVER_ADDR = "/apiv1";
const AUTH_STUDENT_QUERY = "AUTH_STUDENT_QUERY";
const UPDATE_STUDENT_MUTATION = "UPDATE_STUDENT_MUTATION";
function get_data(action, variables) {
  return fetch(SERVER_ADDR, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ action, variables })
  });
}
function getClassName(e) {
  if (e) {
    return "form-control is-invalid";
  }
  return "form-control";
}
function LoginPanel(props) {
  const initialValues={ id: "", pw: "" };
  return (
    <Formik
      initialValues={initialValues}
      validate={function(values) {
        let errors = {};
        if (!values.id) {
          errors.id = "Username cannot be blank";
        }
        if (!values.pw) {
          errors.pw = "Password cannot be blank";
        }
        if (values.pw.length !== 6) {
          errors.pw = "Wrong password";
        }
        return errors;
      }}
      onSubmit={function(values, { setSubmitting, setErrors }) {
        console.log(values);
        get_data(AUTH_STUDENT_QUERY, values)
          .then(function(r) {
            return r.json();
          })
          .then(function(data) {
           window.data = data
            if (data.errors) {
              setErrors({
                pw: `Error:${JSON.stringify(
                  data.errors.map(function(e) {
                    return e.message;
                  })
                )}`
              });
            }
            if (data.data === null) {
              setErrors({ pw: "Wrong password" });
            } else {
              props.setData(data.data);
              props.changeStage(1);
            }
            setSubmitting(false);
          })
          .catch((e) => {
            console.log(e);
            setErrors({ pw: JSON.stringify(e) });
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
        isSubmitting
      }) {
        return (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="id">学号</label>
              <input
                type="text"
                className={getClassName(touched.id && errors.id)}
                name="id"
                value={values.id}
                onChange={handleChange}
              />
              {errors.id &&
                touched.id && (
                  <div className="invalid-feedback">{errors.id}</div>
                )}
            </div>
            <div className="form-group">
              <label htmlFor="pw">密码</label>
              <input
                type="password"
                className={getClassName(touched.pw && errors.pw)}
                name="pw"
                value={values.pw}
                onChange={handleChange}
              />
              {errors.pw &&
                touched.pw && (
                  <div className="invalid-feedback">{errors.pw}</div>
                )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "Sign in"}
            </button>
          </form>
        );
      }}
    </Formik>
  );
}
function EditPanel(props) {
  return (
    <div>
      <button className="btn btn-warning" type="button" onClick={() => props.changeStage(0)}>
        Log out&nbsp;(Warning: Your data will not be saved!)
      </button>
      <hr />
      <Formik
        initialValues={props.data}
        validate={function(values) {
          let errors = {};
          if (values.name === null || values.name === '') {
            errors = Object.assign({}, errors, { name: "Invalid Field: This field cannot be blank." });
          }
          if (values.gender === null || values.gender === '') {
            errors = Object.assign({}, errors, { gender: "Invalid Field: This field cannot be blank." });
          }
          if (values.politicalStatus === null || values.politicalStatus === '') {
            errors = Object.assign({}, errors, { politicalStatus: "Invalid Field: This field cannot be blank." });
          }
          if (values.domitary && !RegExp("^[0-9-]*$").test(values.domitary)) {
            errors = Object.assign({}, errors, { domitary: "Invalid Field: Please refer to the instructions below." });
          }
          if (values.bed && !/^[0-9. ]*$/.test(values.bed)) {
            errors = Object.assign({}, errors, { bed: "Invalid Field: This field is numeric only." });
          }
          if (values.phone && !/^[0-9. ]*$/.test(values.phone)) {
            errors = Object.assign({}, errors, { phone: "Invalid Field: This field is numeric only." });
          }
          if (values.phone === null || values.phone === '') {
            errors = Object.assign({}, errors, { phone: "Invalid Field: This field cannot be blank." });
          }
          if (values.birthday && !/^[0-9\-+:. ]*$/.test(values.birthday)) {
            errors = Object.assign({}, errors, { birthday: "Invalid Field: This field is date only." });
          }
          return errors;
        }}
        onSubmit={function(values, { setSubmitting, setErrors }) {
          console.log("submitting");
          const postValues = Object.assign({}, values, {
            bed: parseInt(values.bed, 10),
            phone: parseInt(values.phone, 10),
          });
          get_data(UPDATE_STUDENT_MUTATION, postValues)
            .then(function(r) {
              return r.json();
            })
            .then(function(data) {
              console.log(data)
              if (data.errors) {
                setErrors({
                  formError: `Error:${JSON.stringify(
                    data.errors.map(function(e) {
                      return e.message;
                    })
                  )}`
                });
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
          isSubmitting
        }) {
          return (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="id">学号</label>
                <input
                  type="text"
                  name="id"
                  value={values.id}
                  readonly
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">姓名</label>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  className={getClassName(touched.name && errors.name)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.name &&
                  touched.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
              </div>
              <div className="form-group">
                <label htmlFor="gender">性别</label>
                <select
                  className={getClassName(touched.gender && errors.gender)}
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option>请选择</option>
                  <option value="女">女</option>
                  <option value="男">男</option>
                  <option value="其他">其他</option>
                </select>
                {errors.gender &&
                  touched.gender && (
                    <div className="invalid-feedback">{errors.gender}</div>
                  )}
              </div>
              <div className="form-group">
                <label htmlFor="politicalStatus">政治面貌</label>
                <input
                  type="text"
                  name="politicalStatus"
                  value={values.politicalStatus}
                  className={getClassName(touched.politicalStatus && errors.politicalStatus)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <small id="politicalStatusHelp" class="form-text text-muted">
                  如：群众、共青团员、预备党员、共产党员
                </small>
                {errors.politicalStatus &&
                  touched.politicalStatus && (
                    <div className="invalid-feedback">{errors.politicalStatus}</div>
                  )}
              </div>
              <div className="form-group">
                <label htmlFor="domitary">宿舍</label>
                <input
                  type="text"
                  name="domitary"
                  value={values.domitary}
                  className={getClassName(touched.domitary && errors.domitary)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <small id="domitaryHelp" class="form-text text-muted">
                  宿舍请按如下方式填写：<br />其他宿舍: 01-101<br />06栋: 06-1-101-1
                </small>
                {errors.domitary &&
                  touched.domitary && (
                    <div className="invalid-feedback">{errors.domitary}</div>
                  )}
              </div>
              <div className="form-group">
                <label htmlFor="bed">床号</label>
                <input
                  type="text"
                  name="bed"
                  value={values.bed}
                  className={getClassName(touched.bed && errors.bed)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.bed &&
                  touched.bed && (
                    <div className="invalid-feedback">{errors.bed}</div>
                  )}
              </div>
              <div className="form-group">
                <label htmlFor="phone">学生手机号码</label>
                <input
                  type="text"
                  name="phone"
                  value={values.phone}
                  className={getClassName(touched.phone && errors.phone)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.phone &&
                  touched.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
              </div>
              <div className="form-group">
                <label htmlFor="birthday">出生年份</label>
                <input
                  type="text"
                  name="birthday"
                  value={values.birthday}
                  className={getClassName(touched.birthday && errors.birthday)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.birthday &&
                  touched.birthday && (
                    <div className="invalid-feedback">{errors.birthday}</div>
                  )}
              </div>
              {errors.formError && (
                <div className="form-group">
                  <div className="text-danger">{errors.formError}</div>
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                Confirm
              </button>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
function Thank(props) {
  return (
    <div>
      <h1>Success!</h1>
      <button
        className="btn btn-primary"
        onClick={function() {
          props.changeStage(0);
        }}
      >
        Click here to go back
      </button>
    </div>
  );
}
class Nav extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      stage: 0,
      data: null
    };
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
          <h2 className="header">
            学生信息统计
          </h2>
        </div>
        {this.state.stage === 0 && (
          <LoginPanel
            changeStage={this.changeStage.bind(this)}
            setData={this.setData.bind(this)}
          />
        )}
        {this.state.stage === 1 && (
          <EditPanel
            data={this.state.data}
            changeStage={this.changeStage.bind(this)}
            setData={this.setData.bind(this)}
          />
        )}
        {this.state.stage === 2 && (
          <Thank changeStage={this.changeStage.bind(this)} />
        )}
      </div>
    );
  }
}
ReactDOM.render(<Nav />, document.getElementById("root"));
