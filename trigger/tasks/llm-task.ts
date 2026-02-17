import { task } from "@trigger.dev/sdk/v3";

export const llmTask = task({
  id: "llm-task",
  run: async (payload: {
    prompt: string;
    image?: string | null;
  }) => {
    const { prompt, image } = payload;

    const selectedModel = "gemini-3-flash-preview";

    let body: any;

    if (image) {
      const base64Data = image.split(",")[1];

      body = {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "image/png",
                  data: base64Data,
                },
              },
              {
                text: prompt || "Describe this image in 3 lines like which image is trying to say.",
              },
            ],
          },
        ],
      };
    } else {
      body = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_API_KEY!,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini error");
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        ?.filter(Boolean)
        ?.join("") || "No response";

    return text;
  },
});
