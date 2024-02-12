import {Request, Response} from "express";

export const signup = (req: Request, res: Response) => {
    const { firstName, lastName, homeAddress } = req.body;
    console.log(`FirstName: ${firstName}, LastName: ${lastName}, HomeAddress: ${homeAddress}`)
    res.send('Hello World');
}