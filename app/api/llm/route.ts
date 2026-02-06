import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, image, model } = await req.json();

    const selectedModel = model || "gemini-2.5-flash";

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
            parts: [
              {
                text: prompt,
              },
            ],
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
      console.error("Gemini Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Gemini error" },
        { status: 500 }
      );
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text)
        ?.filter(Boolean)
        ?.join("") || "No response";

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
