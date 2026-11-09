import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Capability, RoomView, VisualQuestion, RoomState, Settings, Team } from "./types";

const capability = z.object({ id: z.string().min(1), token: z.string().min(32) });
const requestSchema = z.object({
  op: z.enum(["workspace", "bank", "edit", "upload", "rooms", "create", "join", "view", "action"]),
  cap: capability.optional(),
  key: z.string().optional(),
  name: z.string().optional(),
  data: z.unknown().optional(),
});
export const classroomRequest = createServerFn({ method: "POST" })
  .inputValidator((v) => requestSchema.parse(v))
  .handler(async ({ data }) => {
    const { handleClassroom } = await import("./classroom.server");
    return (await handleClassroom(data)) as {
      cap?: Capability;
      room?: RoomView;
      bank?: VisualQuestion[];
      rooms?: { id: string; pin: string; mode: string; phase: string }[];
      path?: string;
      error?: string;
    };
  });
export type ClassroomRequest = z.infer<typeof requestSchema>;
