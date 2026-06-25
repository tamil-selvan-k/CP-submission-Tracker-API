async function getCodeforces() {
  const resp = await fetch(
    `https://codeforces.com/api/user.status?handle=${process.env.CODEFORCES_PROFILE.trim()}&from=1&count=100`,
  );

  const data = await resp.json();

  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

  return data.result
    .filter(
      (submission) =>
        submission.verdict === "OK" &&
        submission.creationTimeSeconds >= oneDayAgo,
    )
    .map((submission) => ({
      timestamp: submission.creationTimeSeconds,
      date: new Date(submission.creationTimeSeconds * 1000).toISOString().split("T")[0],
      problemName: submission.problem.name,
      submissionLink: `https://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`,
      difficulty: submission.problem.rating ?? null,
      platform: "Codeforces",
      topics: (submission.problem.tags ?? []).join(", "),
    }));
}

export default getCodeforces;
