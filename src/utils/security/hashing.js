import bcrypt from "bcrypt";

export const generateHash = async ({ plainText = "", salt = process.env.SALT_ROUND } = {}) => {
    const saltRounds = parseInt(salt) || 10; // Default to 10 if salt is invalid
    return await bcrypt.hash(plainText, saltRounds);
};

export const compareHash = async ({ plainText, hashed }) => {
    if (!plainText || !hashed) return false; // Prevent bcrypt errors
    return await bcrypt.compare(plainText, hashed);
};
