module.exports.filterAnyReq = async (req, res, next) => {
  req.body = null;
  req.query = null;
  next();
};

module.exports.filterSignUp = async (req, res, next) => {
  if (Object.keys(req.body).length !== 4) {
    target = {
      email: new String(),
      password: new String(),
      first_name: new String(),
      last_name: new String(),
    };
    let ls = Object.getOwnPropertyNames(target);
    Object.entries(req.body).forEach(([key, value]) => {
      if (ls.includes(key)) {
        target[key] = value;
      }
    });
    req.body = target;
    console.log("good");
  }
  req.query = null;
  next();
};

module.exports.filterLogin = async (req, res, next) => {
  if (Object.keys(req.body).length !== 2) {
    let list = {
      email: new String(),
      password: new String(),
    };
    let ls = Object.getOwnPropertyNames(list);
    Object.entries(req.body).forEach(([key, value]) => {
      if (ls.includes(key)) {
        list[key] = value;
      }
    });
    req.body = list;
  }
  req.query = null;
  next();
};

module.exports.filterChangePassword = async (req, res, next) => {
  if (Object.keys(req.body).length !== 2) {
    let list = {
      LastPassword: new String(),
      NewPassword: new String(),
    };
    let ls = Object.getOwnPropertyNames(list);
    Object.entries(req.body).forEach(([key, value]) => {
      if (ls.includes(key)) {
        list[key] = value;
      }
    });
    req.body = list;
  }
  req.query = null;
  next();
};

module.exports.filterDeleteUser = async (req, res, next) => {
  if (Object.keys(req.body).length !== 1) {
    let list = {
      password: new String(),
    };
    let ls = Object.getOwnPropertyNames(list);
    Object.entries(req.body).forEach(([key, value]) => {
      if (ls.includes(key)) {
        list[key] = value;
      }
    });
    req.body = list;
  }
  req.query = null;
  next();
};

module.exports.filterShowVideo = async (req, res, next) => {
  if (req.query.length !== 2) {
    let list = {
      userId: new Object(),
      vedioName: new Object()
    };
    let ls = Object.getOwnPropertyNames(list)
    Object.entries(req.query).forEach(([key, value]) => {
      if (ls.includes(key)) {
        list[key] = value
      }
    })
    req.query = list
  }
  req.body = null
  next()
}

module.exports.filterupdateVideo = async (req, res, next) => {
  if (req.body.length !== 2) {
    let list = {
      title: new String(),
      category: new String(),
    };
    let ls = Object.getOwnPropertyNames(list)
    Object.entries(req.body).forEach(([key,value]) => {
      if (ls.includes(key)) {
        list[key] = value
      }
    })
    req.body = list
  }
  req.query = null
  next()
}