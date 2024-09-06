import { Context } from "hono";
import { z } from "zod";

const parseData = <T extends z.ZodTypeAny>(data: unknown, schema: T) => {
  return schema.parse(data) as z.infer<T>;
};

export const parseJson = async <T extends z.ZodTypeAny>(c: Context, schema: T) => {
  const json = await c.req.json<T>();
  try {
    const data = parseData<T>(json, schema);
    return {
      success: true,
      data,
    } as const;
  } catch {
    return {
      success: false,
      error: "Invalid request",
    } as const;
  }
};
