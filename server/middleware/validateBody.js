export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const fields = error.details.reduce((result, detail) => {
        const fieldName = detail.path.join(".");

        if (!result[fieldName]) {
          result[fieldName] = detail.message;
        }

        return result;
      }, {});

      return res.status(400).json({
        message: "Validation failed.",
        fields,
      });
    }

    req.validatedBody = value;

    return next();
  };
}
