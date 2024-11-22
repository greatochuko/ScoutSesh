"use server";

import connectDB from "@/db/connectDB";
import Organization from "@/db/models/Organization";
import User from "@/db/models/User";
import { uploadImage } from "@/lib/utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const errorMessages = {
  firstName: "Please enter your First name",
  lastName: "Please enter your Last name",
  email: "Please enter a valid Email",
  password: "Please enter a Password",
  role: "Please select a Role",
};

export async function login(formData: FormData) {
  const cookieStore = await cookies();

  const email = formData.get("email");
  const password = formData.get("password") as string;

  try {
    await connectDB();

    if (!email) throw new Error("Please enter a valid Email");
    if (!password) throw new Error("Please enter your Password");

    // Get user object from the database
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email and password combination");

    // Compare raw password and hashed password
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect)
      throw new Error("Invalid email and password combination");

    // Create access token and store in cookie
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);
    cookieStore.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });

    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies();
  const role = formData.get("role");

  const userData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password") as string,
    role,
    organization: role === "Head Coach" ? null : formData.get("organization"),
  };

  try {
    // Run validation
    Object.entries(userData).forEach(([key, value]) => {
      if (!value) {
        if (!(role === "Head Coach" && key === "organization"))
          throw new Error(errorMessages[key as keyof typeof errorMessages]);
      }
    });

    if (userData.password.length < 8)
      throw new Error("Password must be at least 8 characters");

    // Encrypt password
    const encryptedPassword = await bcrypt.hash(userData.password, 10);

    // Create new user
    await connectDB();
    const newUser = await User.create({
      ...userData,
      password: encryptedPassword,
    });

    // Create access token and store in cookie
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!);
    cookieStore.set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });

    return { error: null };
  } catch (err) {
    const error = err as Error;

    // Handle Error for duplicate Email
    if (error.name === "MongoServerError" && error.message.includes("E11000")) {
      return { error: "User with email already exists" };
    }
    return { error: error.message };
  }
}

export async function createOrganization(formData: FormData) {
  const userId = formData.get("userId")!;
  const organizationData = {
    name: formData.get("organizationName"),
    profilePicture: formData.get("profilePicture"),
    type: formData.get("organizationType"),
    memberCount: formData.get("memberCount"),
    location: formData.get("location"),
    primarySport: formData.get("primarySport"),
    yearFounded: formData.get("yearFounded"),
    bio: formData.get("bio"),
  };

  try {
    // Upload organization profile picture
    const { url, error } = await uploadImage(
      organizationData.profilePicture as string
    );
    if (error) throw new Error("An error occured uploading profile picture");
    organizationData.profilePicture = url;

    // Create new organization and bind to user's profile
    await connectDB();
    const newOrganization = await Organization.create(organizationData);
    const data = await User.findByIdAndUpdate(userId, {
      organization: newOrganization._id,
    });
    if (!data) throw new Error("An error occured");

    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function completeProfile(formData: FormData) {
  const userId = formData.get("userId");
  const userData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
    DOB: formData.get("DOB"),
    profilePicture: formData.get("profilePicture"),
    location: formData.get("location"),
    primarySport: formData.get("primarySport"),
    experience: formData.get("experience"),
    bio: formData.get("bio"),
  };

  try {
    // Upload organization profile picture
    const { url, error } = await uploadImage(userData.profilePicture as string);
    if (error) throw new Error("An error occured uploading profile picture");
    userData.profilePicture = url;

    await connectDB();
    const data = await User.findByIdAndUpdate(userId, userData);
    if (!data) throw new Error("An error occured");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  revalidatePath("/", "layout");
  redirect("/login");
}
