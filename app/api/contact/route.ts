export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, message, website } = data;

    // Spam honeypot: if filled by a bot, silently return success
    if (website) {
      return Response.json({ success: true }, { status: 200 });
    }

    if (!name || !email || !message) {
      return Response.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: "ed671d6c-7f87-40f4-8f76-94b8f181465f",
        name,
        email,
        message,
        subject: `New Portfolio Message from ${name}`,
        from_name: name,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return Response.json({ success: true }, { status: 200 });
    }

    return Response.json(
      { error: result.message || "Failed to send message. Please try again." },
      { status: 400 },
    );
  } catch (err) {
    return Response.json(
      { error: "Service temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
