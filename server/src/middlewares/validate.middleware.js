export const validate = (schema, target = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    // Create it only once
    req.validated ??= {
      body: {},
      query: {},
      params: {},
    };

    // Store the validated data
    req.validated[target] = result.data;

    next();
  };
};
