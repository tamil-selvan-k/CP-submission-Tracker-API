import express from "express";
import { createClient } from "redis";
import dotenv from "dotenv";
import morgan from "morgan";

import { getCodeforces, getLeetCode, getAtCoder } from './utils/index.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("common"));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "CP Submission Tracker API!",
  })
})

app.get("/api/v1/submissions", async (req, res) => {
  try {
    const [codeforces, leetcode, atcoder] = await Promise.all([
      getCodeforces(),
      getLeetCode(),
      // getAtCoder(),
    ]);

    const submissions = [...codeforces, ...leetcode].sort( // add ...atcoder when getAtCoder is uncommented
      (a, b) => a.timestamp - b.timestamp,
    );

    res.json(submissions);
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
});

app.get("/api/v1/codeforces", async (req, res) => {
  try {
    const resp = await fetch(
      `https://codeforces.com/api/user.status?handle=${process.env.CODEFORCES_PROFILE.trim()}&from=1&count=100`,
    );
    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err });
  }
});

app.get("/api/v1/leetcode", async (req, res) => {
  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        query recentSubmissions($username: String!) {
          recentSubmissionList(username: $username) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      `,
        variables: {
          username: process.env.LEETCODE_PROFILE.trim(),
        },
      }),
    });

    const data = await response.json();

    const difficultyAndTopics = await Promise.all(
      data.data.recentSubmissionList.map(async (each) => {
        const resp = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
              titleSlug: each.titleSlug,
            },
          }),
        });

        return resp.json();
      }),
    );

    res.status(200).json({
      date: data,
      difficultyAndTopics: difficultyAndTopics,
    });
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`),
);
