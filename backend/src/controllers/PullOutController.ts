import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { TAKE } from "../lib/constants";
import prisma from "../lib/prisma";
const model = prisma.pullOut;

class PullOutController {
  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let [data, totalData] = await prisma.$transaction([
        model.findMany(),
        model.count(),
      ]);
      return res.status(200).send({ body: data, totalData });
    } catch (error: any) {
      return res.status(404).send(error.message);
    }
  };

  static search = async (req: Request, res: Response) => {
    const {
      query = "",
      page = 0,
      sortById,
      updatedAt = 1,
      createdAt,
      id,
    } = req.query;
    const filters: any = [];
    let where: any = {
      OR: [
        {
          id: {
            gte:0
          }
        },
      ],
      AND: filters,
    };
    let orderBy: any = {};

    if (updatedAt) {
      Object.assign(orderBy, {
        updatedAt: Number(updatedAt) ? "desc" : "asc",
      });
    } else if (id) {
      Object.assign(orderBy, {
        id: Number(id) ? "desc" : "asc",
      });
    }else if (sortById) {
      Object.assign(orderBy, {
        id: Number(sortById) ? "desc" : "asc",
      });
    } else {
      Object.assign(orderBy, {
        createdAt: Number(createdAt) ? "desc" : "asc",
      });
    }
    try {
      let data = await model.findMany()
        // model.count({ where }),
      console.log(req.query)
  
      let totalPages = Math.ceil(Number(2) / Number(TAKE)) - 1;
      return res.status(200).send({ body: data, totalPages });
      // return res.status(200)
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  };
  static getOne = async (req: Request, res: Response) => {
    try {
      const data = await model.findFirst({
        where: {
          id: Number(req.params.id),
        },
      });
      return res.status(200).send(data);
    } catch (error: any) {
      return res.status(400).send(error.message);
    }
  };

  static create = async (req: Request, res: Response) => {
    const { name, address } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {

      console.log(req.body)
    //   const data = await model.create({
    //     data: {
    //       name,
    //       address
    //     },
    //   });
      return res.status(200).send();
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  };
  static update = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
    //   const { name } = req.body;
    //   const id = req.params.id;
    //   const branch = await model.update({
    //     where: { id: Number(id) },
    //     data: {
    //       name,
    //     },
    //   });
    //   return res.json(branch);
    } catch (e: any) {
      return res.status(400).send(e.message);
    }
  };
  static delete = async (req: Request, res: Response) => {
    try {
      const data = await model.delete({
        where: {
          id: Number(req.params.id),
        },
      });
      return res.status(200).send(data);
    } catch (error: any) {
      return res.status(400).send(error.message);
    }
  };
  static deleteMany = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await model.deleteMany({
        where: {
          id: {
            in: req.body,
          },
        },
      });
      return res.status(200).send(data);
    } catch (error: any) {
      return res.status(404).send(error.message);
    }
  };
}
export default PullOutController;
