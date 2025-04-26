import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // You forgot this import
import { prisma } from "../libs/db.js";
import { Role } from "../generated/prisma/index.js";


export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.USER,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SWAGGER_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await prisma.user.findUnique({
        where: { email },
        });
    
        if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
        }
    
        const token = jwt.sign({ id: user.id }, process.env.JWT_SWAGGER_SECRET, {
        expiresIn: "1d",
        });
    
        res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
    
        res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
        },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
    }

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const check = async (req, res) => {
    const token = req.cookies.jwt;
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SWAGGER_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
  
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Unauthorized" });
    }
  };

