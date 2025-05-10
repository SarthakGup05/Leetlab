import { prisma } from "../libs/db.js";
import { getJudge0LanguageId, submitBatch, pollBatchResults } from "../utils/judge0.js";

export const createProblem = async (req, res) => {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
    } = req.body;
  
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "You are not allowed to create a problem" });
    }
  
    try {
      for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
        const languageId = getJudge0LanguageId(language);
  
        if (!languageId) {
          return res
            .status(400)
            .json({ error: `Language ${language} is not supported` });
        }
  
        const submissions = testcases.map(({ input, output }) => ({
          source_code: solutionCode,
          language_id: languageId,
          stdin: input,
          expected_output: output,
        }));
  
        const submissionResults = await submitBatch(submissions);
        const tokens = submissionResults.map((res) => res.token);
        const results = await pollBatchResults(tokens);
  
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status.id !== 3) {
            return res
              .status(400)
              .json({
                error: `Testcase ${i + 1} failed for language ${language}`,
              });
          }
        }
      }

      const newProblem = await prisma.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      });

      return res.status(201).json(newProblem);
    } catch (error) {
      console.error("Error creating problem:", error);
      return res.status(500).json({ error: "Failed to create problem" });
    }
};

export const getAllProblems = async (req, res) => {
    try {
    const problems = await prisma.problem.findMany();

    if (!problems) {
      return res.status(404).json({
        error: "No problems Found",
      });
    }

    res.status(200).json({
      sucess: true,
      message: "Message Fetched Successfully",
      problems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error While Fetching Problems",
    });
  }
};

export const getProblemById = async (req, res) => {
    const { id } = req.params;

  try {
    const problem = await prisma.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    return res.status(200).json({
      sucess: true,
      message: "Message Created Successfully",
      problem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error While Fetching Problem by id",
    });
  }
};

export const updateProblem = async (req, res) => {
    const { id } = req.params;
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
    } = req.body;

  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "You are not allowed to update a problem" });
  }

  try {
    const updatedProblem = await prisma.problem.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
      },
    });

    return res.status(200).json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return res.status(500).json({ error: "Failed to update problem" });
  }
};

export const deleteProblem = async (req, res) => {
    const { id } = req.params;

  try {
    const problem = await prisma.problem.findUnique({ where: { id } });

    if (!problem) {
      return res.status(404).json({ error: "Problem Not found" });
    }

    await prisma.problem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Problem deleted Successfully",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: "Error While deleting the problem",
    });
  }
};

export const getAllProblemsSolvedByUser = async (req, res) => {
   try {
     const problems = await prisma.problem.findMany({
       where: {
         userId: req.user.id,
         status: "SOLVED",
       },
     });

     if (!problems) {
       return res.status(404).json({
         error: "No solved problems found",
       });
     }

     res.status(200).json({
       success: true,
       message: "Message Fetched Successfully",
       problems,
     });
   } catch (error) {
     console.log(error);
     return res.status(500).json({
       error: "Error While Fetching Solved Problems",
     });
   }
};