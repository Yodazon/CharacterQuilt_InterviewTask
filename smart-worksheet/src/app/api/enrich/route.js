import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt, rows, columns, targetColId } = await req.json();
    if (!prompt || !rows || !columns || !targetColId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Prepare context for LLM
    const contextRows = rows.map(row => {
      const obj = {};
      columns.forEach(col => {
        if (col.id !== targetColId) obj[col.label] = row[col.id];
      });
      return obj;
    });

    // Compose LLM prompt
    const systemPrompt =
      `You are a helpful assistant. For each student, generate a value for the column '${columns.find(c => c.id === targetColId)?.label}' based on the following prompt: "${prompt}". Return ONLY a JSON array of values, in the same order as the input. Be concise with your response.`;
    const userPrompt =
      `Input data (array of objects):\n${JSON.stringify(contextRows, null, 2)}\n\nRespond with a JSON array of values for the new column.`;

    // Try OpenAI first
    let values = null;
    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2048,
        }),
      });
      const openaiData = await openaiRes.json();
      if (openaiData.choices && openaiData.choices[0]?.message?.content) {
        // Try to parse JSON array from response
        const match = openaiData.choices[0].message.content.match(/\[.*\]/s);
        if (match) {
          values = JSON.parse(match[0]);
        }
      }
    } catch (e) {
      // Ignore, fallback to Anthropic
    }

    // Fallback to Anthropic if OpenAI fails
    if (!values) {
      try {
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-7-sonnet-20240229",
            max_tokens: 2048,
            messages: [
              { role: "user", content: `${systemPrompt}\n${userPrompt}` },
            ],
          }),
        });
        const anthropicData = await anthropicRes.json();
        if (anthropicData.content && anthropicData.content[0]?.text) {
          const match = anthropicData.content[0].text.match(/\[.*\]/s);
          if (match) {
            values = JSON.parse(match[0]);
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    if (!values || !Array.isArray(values) || values.length !== rows.length) {
      return NextResponse.json({ error: "LLM did not return valid data." }, { status: 500 });
    }

    return NextResponse.json({ values });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
} 