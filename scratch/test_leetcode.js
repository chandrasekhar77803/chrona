async function testLeetCode(username) {
  const apis = [
    `https://leetcode-api-faisalshohag.vercel.app/${username}`,
    `https://alfa-leetcode-api.onrender.com/userProfile/${username}`,
    `https://alfa-leetcode-api.onrender.com/${username}/solved`
  ];

  for (const url of apis) {
    try {
      console.log('Fetching:', url);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('DATA:', JSON.stringify(data).slice(0, 300));
      }
    } catch (e) {
      console.log('ERR:', e.message);
    }
  }
}

testLeetCode('lee215');
