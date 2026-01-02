function validateCreate(body) {
    if (!body || typeof body.title !== "string" || body.title.trim().length < 2) {
      const err = new Error("title must be a string with at least 2 chars");
      err.status = 400;
      throw err;
    }
    return { title: body.title.trim() };
  }
  
  function validateUpdate(body) {
    if (!body || typeof body !== "object") {
      const err = new Error("invalid body");
      err.status = 400;
      throw err;
    }
  
    const out = {};
    if ("title" in body) {
      if (typeof body.title !== "string" || body.title.trim().length < 2) {
        const err = new Error("title must be a string with at least 2 chars");
        err.status = 400;
        throw err;
      }
      out.title = body.title.trim();
    }
  
    if ("done" in body) {
      if (typeof body.done !== "boolean") {
        const err = new Error("done must be boolean");
        err.status = 400;
        throw err;
      }
      out.done = body.done;
    }
  
    if (Object.keys(out).length === 0) {
      const err = new Error("no valid fields to update");
      err.status = 400;
      throw err;
    }
  
    return out;
  }
  
  module.exports = { validateCreate, validateUpdate };