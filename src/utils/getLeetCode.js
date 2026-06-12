async function getLeetCode() {
    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                query recentSubmissions($username: String!) {
                    recentSubmissionList(username: $username) {
                        title
                        titleSlug
                        timestamp
                        statusDisplay
                    }
                }
            `,
            variables: {
                username: process.env.LEETCODE_PROFILE.trim()
            }
        })
    });

    const data = await response.json();
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

    const acceptedSubmissions =
    data.data.recentSubmissionList.filter(
        submission =>
        submission.statusDisplay === "Accepted" &&
        Number(submission.timestamp) >= oneDayAgo
    );


    const leetcodeSubmissions =
    await Promise.all(
        acceptedSubmissions.map(async submission => {
        const resp = await fetch(
            "https://leetcode.com/graphql",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: `
                query questionData($titleSlug: String!) {
                    question(titleSlug: $titleSlug) {
                    difficulty
                    topicTags {
                        name
                    }
                    }
                }
                `,
                variables: {
                titleSlug: submission.titleSlug
                }
            })
            }
        );

        const details =
            await resp.json();

        return {
            timestamp: Number(
            submission.timestamp
            ),
            date: new Date(
            Number(
                submission.timestamp
            ) * 1000
            ).toISOString(),
            problemName:
            submission.title,
            submissionLink: `https://leetcode.com/problems/${submission.titleSlug}`,
            difficulty:
            details.data.question
                .difficulty,
            platform: "LeetCode",
            topics:
            details.data.question.topicTags
                .map(tag => tag.name)
                .join(", ")
        };
        })
    );

    return leetcodeSubmissions;
}

export default getLeetCode;