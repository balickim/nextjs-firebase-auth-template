import admin from "../firebase";
import User from "../models/user";

export async function isAuthenticated(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).send({ message: "Unauthorized" });

  if (!authorization.startsWith("Bearer"))
    return res.status(401).send({ message: "Unauthorized" });

  const split = authorization.split("Bearer ");
  if (split.length !== 2)
    return res.status(401).send({ message: "Unauthorized" });

  const token = split[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("decodedToken", JSON.stringify(decodedToken));
    res.locals = {
      ...res.locals,
      uid: decodedToken.uid,
      role: decodedToken.role,
      email: decodedToken.email,
    };
    return next();
  } catch (err) {
    console.error(`${err.code} -  ${err.message}`);
    return res.status(401).send({ message: "Unauthorized" });
  }
}

export function isAuthorized(opts, allowSameUser) {
  return (req, res, next) => {
    const { role, email, uid } = res.locals;
    const { id } = req.params;

    if (opts.allowSameUser && id && uid === id) return next();

    if (!role) return res.status(403).send();

    if (opts.hasRole.includes(role)) return next();

    return res.status(403).send();
  };
}

export const findOrCreateUser = async (req, res, next) => {
  // console.log("REQ HEADERS TOKEN", req.headers.token);
  try {
    const firebaseUser = await admin.auth().verifyIdToken(req.headers.token);
    // console.log("FIREBASE USER IN CURRENT USER MIDDLEWARE", firebaseUser);
    // save the user to db or send user response if it is already saved
    const user = await User.findOne({ email: firebaseUser.email });
    if (user) {
      // send user response
      // console.log("FOUND USER =====> ", user);
      // add current user to req object
      req.currentUser = user;
      next();
      // res.json(user);
    } else {
      // create new user and then send that user as response
      let newUser = await new User({
        email: firebaseUser.email,
        name: firebaseUser.name
          ? firebaseUser.name
          : firebaseUser.email.split("@")[0],
        picture: firebaseUser.picture ? firebaseUser.picture : "/avatar.png",
      }).save();
      // console.log("NEW USER =====> ", newUser);
      req.currentUser = newUser;
      next();
      // res.json(newUser);
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      err: "Invalid or expired token",
    });
  }
};
