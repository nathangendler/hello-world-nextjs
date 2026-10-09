export type AiErrorKind = "not_configured" | "blocked" | "http" | "empty";

export class AiError extends Error {
  constructor(
    message: string,
    readonly kind: AiErrorKind,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export type AiImage = { mimeType: string; base64: string };

export type JsonRequest = {
  prompt: string;
  image: AiImage | null;
  // Number of strings expected under the "captions" key of the returned object.
  itemCount: number;
};

export type JsonResponse = { model: string; text: string };
