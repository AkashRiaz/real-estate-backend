import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AgentService } from "./agent.service";

const getAllAgents = catchAsync(async (req: Request, res: Response) => {
  const result = await AgentService.getAllAgents(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agents retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAgentById = catchAsync(async (req: Request, res: Response) => {
  const result = await AgentService.getAgentById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent retrieved successfully",
    data: result,
  });
});

const updateMyAgentProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await AgentService.updateMyAgentProfile(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent profile updated successfully",
    data: result,
  });
});

const verifyAgent = catchAsync(async (req: Request, res: Response) => {
  const result = await AgentService.verifyAgent(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.isVerified ? "Agent verified successfully" : "Agent verification removed",
    data: result,
  });
});

export const AgentController = {
  getAllAgents,
  getAgentById,
  updateMyAgentProfile,
  verifyAgent,
};
