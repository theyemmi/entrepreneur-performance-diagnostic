// Vercel serverless function: POST /api/subscribe
// Adds/updates the person in your Mailchimp audience.
// Mailchimp credentials stay server-side in Vercel environment variables.

const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const { name, email, score, weakPillar } = body || {};

  const emailOk =
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailOk) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER = process.env.MAILCHIMP_SERVER_PREFIX;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;

  if (!API_KEY || !SERVER || !LIST_ID) {
    console.error('Missing Mailchimp environment variables');
    res.status(500).json({ error: 'Mailchimp is not configured on the server' });
    return;
  }

  const scoreBucket =
    typeof score === 'number'
      ? score >= 80 ? 'score-80-100'
      : score >= 60 ? 'score-60-79'
      : score >= 40 ? 'score-40-59'
      : 'score-0-39'
      : null;

  const tags = ['performance-diagnostic'];
  if (weakPillar) tags.push('weak-' + String(weakPillar).toLowerCase());
  if (scoreBucket) tags.push(scoreBucket);

  const memberHash = crypto
    .createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex');

  try {
    // PUT is an upsert: a returning visitor gets the newest name/tags
    // instead of a "Member Exists" dead-end.
    const mcRes = await fetch(
      `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${memberHash}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `apikey ${API_KEY}`,
        },
        body: JSON.stringify({
          email_address: email.trim().toLowerCase(),
          status_if_new: 'subscribed',
          merge_fields: {
            FNAME: name || '',
          },
          tags,
        }),
      }
    );

    const data = await mcRes.json();

    if (!mcRes.ok) {
      console.error('Mailchimp error:', data);
      res.status(mcRes.status).json({
        error: data.detail || 'Mailchimp error'
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Subscribe request failed:', err);
    res.status(500).json({ error: 'Server error contacting Mailchimp' });
  }
};
