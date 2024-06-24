import bcrypt from "bcryptjs";
const hashedPassword = await bcrypt.hash("a12345", 10);
console.log(hashedPassword)