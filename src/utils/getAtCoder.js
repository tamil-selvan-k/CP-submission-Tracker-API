async function getAtCoder() {
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

  try {
    const resp = await fetch(
        `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${process.env.ATCODER_PROFILE.trim()}`,
    );
    const data = await resp.json();

    const atcoderSubmissions = data
        .filter((submission) =>
            submission.result === "AC" && submission.epoch_second >= oneDayAgo,
        )
        .map((submission) => ({
            timestamp: submission.epoch_second,
            date: new Date(submission.epoch_second * 1000).toISOString().split("T")[0],
            problemName: submission.problem_id,
            submissionLink: `https://atcoder.jp/contests/${submission.contest_id}/submissions/${submission.id}`,
            difficulty: null,
            platform: "AtCoder",
            topics: [],
        }));
        console.log(atcoderSubmissions);
    } catch (err) {
        console.error(err);
    }

  return atcoderSubmissions;
}

export default getAtCoder;
