import { Request, Response } from "express";
import { createUser } from "../services/createUser";
import { User, UserSignup } from "../models/User";
import { validationResult } from "express-validator";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../firebase/firebaseConfig";

export const signup = (req: Request, res: Response) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(300).send(valResult.array());
  }

  const user: UserSignup = req.body;

  createUserWithEmailAndPassword(firebaseAuth, user.email, user.password)
    .then((r) => {
      r.user
        .getIdToken()
        .then((token) => {
          res.header("x-auth-token", token);
        })
        .catch((e) => {
          res.status(500).send(e.message);
        });

      const newUser: User = {
        _id: r.user.uid,
        displayName: user.displayName,
        address: user.address,
      };
      createUser(newUser)
        .then((r) => {
          res.status(200).send("User Created");
        })
        .catch((e) => {
            r.user.delete().finally(() => res.status(500).send(e.message));
        });
    })
    .catch((e) => {
      res.status(500).send(e.message);
    });
};
