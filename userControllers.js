const Users = require("../model/userModel");
const cloudinary = require("cloudinary");
const { sendEmail } = require("../middleware/sendMail");
const bcrypt = require("bcrypt");

const generateToken = require("../middleware/auth");
const crypto = require("crypto");
const xss = require("xss");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "purnimabohara6@gmail.com",
    pass: "bibz oihx lndz voak",
  },
});
const sendVerifyMail = async (firstName, email, user_id) => {
  try {
    const mailOptions = {
      from: "purnimabohara6@gmail.com",
      to: email,
      subject: "Verification Mail",
      html: `<p>Hi, ${firstName},</p>
             <p>Please click <a href="https://localhost:5000/api/user/verify/${user_id}">here</a> to verify your email.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email successfully sent:", info.response);

  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw error;
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};
const zxcvbn = require('zxcvbn'); 

const checkPasswordStrength = (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required.",
    });
  }

  // Validate password strength using zxcvbn
  const passwordStrength = zxcvbn(password);


  res.status(200).json({
    success: true,
    strength: passwordStrength.score,
    
  });
};
const createUser = async (req, res) => {
  const sanitizedData = {
    firstName: xss(req.body.firstName),
    lastName: xss(req.body.lastName),
    email: xss(req.body.email),
    contactNumber: xss(req.body.contactNumber),
    address: xss(req.body.address),
    password: xss(req.body.password)
  };

  // Validate incoming data
  if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.contactNumber || !sanitizedData.address || !sanitizedData.password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields.",
    });
  }

  // Password complexity regex
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

  if (sanitizedData.password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be minimum 8 characters long.",
    });
  } else if (!complexityRegex.test(sanitizedData.password)) {
    return res.status(400).json({
      success: false,
      message: "Password must include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const existingUser = await Users.findOne({ email: sanitizedData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const spassword = await securePassword(sanitizedData.password);

    const newUser = new Users({
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      contactNumber: sanitizedData.contactNumber,
      address: sanitizedData.address,
      password: spassword,
      passwordHistory: [
        {
          password: spassword,
          changedAt: new Date()
        }
      ]
    });

    const userData = await newUser.save();

    sendVerifyMail(sanitizedData.firstName, sanitizedData.email, userData._id);

    res.status(200).json({
      success: true,
      message: "User created successfully. Please check your email to verify.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
};

// const createUser = async (req, res) => {
//   const sanitizedData = {
//     firstName: xss(req.body.firstName),
//     lastName: xss(req.body.lastName),
//     email: xss(req.body.email),
//     contactNumber: xss(req.body.contactNumber),
//     address: xss(req.body.address),
//     password: xss(req.body.password)
//   };

//   // Validate incoming data
//   if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.contactNumber || !sanitizedData.address || !sanitizedData.password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields.",
//     });
//   }

//   // Password complexity regex
//   const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

//   if (sanitizedData.password.length < 8) {
//     return res.status(400).json({
//       success: false,
//       message: "Password must be minimum 8 characters long.",
//     });
//   } else if (!complexityRegex.test(sanitizedData.password)) {
//     return res.status(400).json({
//       success: false,
//       message: "Password must include uppercase, lowercase, number, and special character.",
//     });
//   }

//   try {
//     const existingUser = await Users.findOne({ email: sanitizedData.email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists.",
//       });
//     }

//     const spassword = await securePassword(sanitizedData.password);

//     const newUser = new Users({
//       firstName: sanitizedData.firstName,
//       lastName: sanitizedData.lastName,
//       email: sanitizedData.email,
//       contactNumber: sanitizedData.contactNumber,
//       address: sanitizedData.address,
//       password: spassword,
//     });

//     const userData = await newUser.save();

//     sendVerifyMail(sanitizedData.firstName, sanitizedData.email, userData._id);

//     res.status(200).json({
//       success: true,
//       message: "User created successfully. Please check your email to verify.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json("Server Error");
//   }
// };



// const createUser = async (req, res) => {
//   const sanitizedData = {
//     firstName: xss(req.body.firstName),
//     lastName: xss(req.body.lastName),
//     email: xss(req.body.email),
//     contactNumber: xss(req.body.contactNumber),
//     address: xss(req.body.address),
//     password: xss(req.body.password)
//   };

//   // Validate incoming data
//   if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.contactNumber || !sanitizedData.address || !sanitizedData.password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields.",
//     });
//   }

//   // Password complexity regex
//   const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

//   // Validate password complexity
//   if (sanitizedData.password.length < 8 || sanitizedData.password.length > 12) {
//     return res.status(400).json({
//       success: false,
//       message: "Password must be between 8 to 12 characters long.",
//     });
//   } else if (!complexityRegex.test(sanitizedData.password)) {
//     return res.status(400).json({
//       success: false,
//       message: "Password must include uppercase, lowercase, number, and special character.",
//     });
//   }

//   try {
//     const existingUser = await Users.findOne({ email: sanitizedData.email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists.",
//       });
//     }

//     const spassword = await securePassword(sanitizedData.password);

//     const newUser = new Users({
//       firstName: sanitizedData.firstName,
//       lastName: sanitizedData.lastName,
//       email: sanitizedData.email,
//       contactNumber: sanitizedData.contactNumber,
//       address: sanitizedData.address,
//       password: spassword,
//     });

//     const userData = await newUser.save();

//     sendVerifyMail(sanitizedData.firstName, sanitizedData.email, userData._id);

//     res.status(200).json({
//       success: true,
//       message: "User created successfully. Please check your email to verify.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json("Server Error");
//   }
// };

const verifyMail = async (req, res) => {
  try {
    console.log("Verify Mail Request Params:", req.params);
    const updateInfo = await Users.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: { is_verified: 1 },
      }
    );
    console.log("Update Info:", updateInfo);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Verify Mail Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
const loginUser = async (req, res) => {
  console.log(req.body);
  const sanitizedData = {
      email: xss(req.body.email),
      password: xss(req.body.password),
  };

  if (!sanitizedData.email || !sanitizedData.password) {
      return res.status(400).json({
          success: false,
          message: "Please enter all fields.",
      });
  }

  try {
      const user = await Users.findOne({ email: sanitizedData.email });
      if (!user) {
          return res.status(401).json({
              success: false,
              message: "User doesn't exist.",
          });
      }

      // Check if the account is locked
      if (user.isLocked && user.lockUntil > Date.now()) {
          const lockTimeLeft = Math.round((user.lockUntil - Date.now()) / 1000 / 60);
          return res.status(423).json({
              success: false,
              message: `Account is temporarily locked. Try again in ${lockTimeLeft} minutes.`,
          });
      }
      const isMatch = await user.comparePassword(sanitizedData.password);
      if (!isMatch) {
          const attemptsLeft = 3 - user.failedLoginAttempts - 1;
          await user.incrementLoginAttempts();

          if (user.failedLoginAttempts + 1 >= 3 && !user.isLocked) {
              user.lockUntil = Date.now() + 15 * 60 * 1000;
              user.failedLoginAttempts = 0;

              const mailOptions = {
                  from: "purnimabohara6@gmail.com",
                  to: user.email,
                  subject: "Account Locked Due to Multiple Failed Login Attempts",
                  html: `<p>Hi ${user.firstName},</p>
                         <p>Your account has been locked for 15 minutes due to multiple failed login attempts. If this wasn't you, please reset your password immediately.</p>`,
              };
              transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                      console.error('Error sending email:', error);
                  } else {
                      console.log('Email sent:', info.response);
                  }
              });

              await user.save();
              return res.status(423).json({
                  success: false,
                  message: "Too many failed login attempts. Your account has been locked for 15 minutes.",
              });
          } else {
              await user.save();
              return res.status(400).json({
                  success: false,
                  message: `Invalid credentials. You have ${attemptsLeft} attempt(s) left.`,
              });
          }
      }

      // Check if the password has expired
      if (user.isPasswordExpired()) {
          const gracePeriodStart = user.gracePeriodStart || Date.now();
          const gracePeriod = 5 * 60 * 1000; // 5 minutes
          const currentTime = Date.now();

          // Condition 1: If the grace period has expired
          if (currentTime - gracePeriodStart > gracePeriod) {
              return res.status(403).json({
                  success: false,
                  message: "Your password has expired, and the grace period has ended. Please reset your password to continue.",
              });
          }

          // Start the grace period
          if (!user.gracePeriodStart) {
              user.gracePeriodStart = gracePeriodStart;
              await user.save();
          }

          // Condition 2: If the user logs in during the grace period
          return res.status(403).json({
              success: false,
              message: "Your password has expired. Please change your password within the next 5 minutes.",
              redirect: "/profile", // Redirect to the profile page for password change
          });
      }

      // Reset grace period start if the login is successful
      if (user.gracePeriodStart) {
          user.gracePeriodStart = null;
          await user.save();
      }

      // Reset login attempts if successful login
      if (user.isLocked || user.failedLoginAttempts > 0) {
          user.failedLoginAttempts = 0;
          user.lockUntil = undefined;
          await user.save();
      }

      const token = generateToken(user._id);

      res.status(200).json({
          success: true,
          token: token,
          userData: user,
          message: "User logged in successfully.",
          isAdmin: user.isAdmin,
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          success: false,
          message: "Server error. Please try again later.",
      });
  }
};




// const loginUser = async (req, res) => {
//   console.log(req.body);
//   const sanitizedData = {
//     email: xss(req.body.email),
//     password: xss(req.body.password),
//   };

//   if (!sanitizedData.email || !sanitizedData.password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields.",
//     });
//   }

//   try {
//     const user = await Users.findOne({ email: sanitizedData.email });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User doesn't exist.",
//       });
//     }

//     // Check if account is locked
//     if (user.isLocked && user.lockUntil > Date.now()) {
//       const lockTimeLeft = Math.round((user.lockUntil - Date.now()) / 1000 / 60);
//       return res.status(423).json({
//         success: false,
//         message: `Account is temporarily locked. Try again in ${lockTimeLeft} minutes.`,
//       });
//     }

//     const isMatch = await user.comparePassword(sanitizedData.password);
//     if (!isMatch) {
//       const attemptsLeft = 3 - user.failedLoginAttempts - 1;
//       await user.incrementLoginAttempts();

//       if (user.failedLoginAttempts + 1 >= 3 && !user.isLocked) {
//         user.lockUntil = Date.now() + 15 * 60 * 1000;
//         user.failedLoginAttempts = 0;

//         const mailOptions = {
//           from: "purnimabohara6@gmail.com",
//           to: user.email,
//           subject: "Account Locked Due to Multiple Failed Login Attempts",
//           html: `<p>Hi ${user.firstName},</p>
//                  <p>Your account has been locked for 15 minutes due to multiple failed login attempts. If this wasn't you, please reset your password immediately.</p>`,
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//           if (error) {
//             console.error('Error sending email:', error);
//           } else {
//             console.log('Email sent:', info.response);
//           }
//         });

//         await user.save();
//         return res.status(423).json({
//           success: false,
//           message: "Too many failed login attempts. Your account has been locked for 15 minutes.",
//         });
//       } else {
//         await user.save();
//         return res.status(400).json({
//           success: false,
//           message: `Invalid credentials. You have ${attemptsLeft} attempt(s) left.`,
//         });
//       }
//     }

//     // Check if password has expired using the method from the schema
//     if (user.isPasswordExpired()) {
//       return res.status(403).json({
//         success: false,
//         message: "Your password has expired. Please reset your password to continue.",
//       });
//     }

//     // Reset login attempts if successful login
//     if (user.isLocked || user.failedLoginAttempts > 0) {
//       user.failedLoginAttempts = 0;
//       user.lockUntil = undefined;
//       await user.save();
//     }

//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       token: token,
//       userData: user,
//       message: "User logged in successfully.",
//       isAdmin: user.isAdmin,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again later.",
//     });
//   }
// };


// const loginUser = async (req, res) => {
//   console.log(req.body);
//   const sanitizedData = {
//     email: xss(req.body.email),
//     password: xss(req.body.password),
//   };

//   if (!sanitizedData.email || !sanitizedData.password) {
//     return res.status(400).json({
//       success: false,
//       message: "Please enter all fields.",
//     });
//   }

//   try {
//     const user = await Users.findOne({ email: sanitizedData.email });
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User doesn't exist.",
//       });
//     }

//     // Check if account is locked
//     if (user.isLocked && user.lockUntil > Date.now()) {
//       const lockTimeLeft = Math.round((user.lockUntil - Date.now()) / 1000 / 60);
//       return res.status(423).json({
//         success: false,
//         message: `Account is temporarily locked. Try again in ${lockTimeLeft} minutes.`,
//       });
//     }

//     const isMatch = await user.comparePassword(sanitizedData.password);
//     if (!isMatch) {
//       const attemptsLeft = 3 - user.failedLoginAttempts - 1;
//       await user.incrementLoginAttempts();

//       if (user.failedLoginAttempts + 1 >= 3 && !user.isLocked) {
//         user.lockUntil = Date.now() + 15 * 60 * 1000;
//         user.failedLoginAttempts = 0;

//         const mailOptions = {
//           from: "purnimabohara6@gmail.com",
//           to: user.email,
//           subject: "Account Locked Due to Multiple Failed Login Attempts",
//           html: `<p>Hi ${user.firstName},</p>
//                  <p>Your account has been locked for 15 minutes due to multiple failed login attempts. If this wasn't you, please reset your password immediately.</p>`,
//         };
//         transporter.sendMail(mailOptions, function (error, info) {
//           if (error) {
//             console.error('Error sending email:', error);
//           } else {
//             console.log('Email sent:', info.response);
//           }
//         });

//         await user.save();
//         return res.status(423).json({
//           success: false,
//           message: "Too many failed login attempts. Your account has been locked for 15 minutes.",
//         });
//       } else {
//         await user.save();
//         return res.status(400).json({
//           success: false,
//           message: `Invalid credentials. You have ${attemptsLeft} attempt(s) left.`,
//         });
//       }
//     }

//     const passwordExpiryDays = 90;
//     const passwordAge = Date.now() - new Date(user.passwordChangedAt).getTime();
//     const passwordExpired = passwordAge > passwordExpiryDays * 24 * 60 * 60 * 1000;

//     if (passwordExpired) {
//       return res.status(403).json({
//         success: false,
//         message: "Your password has expired. Please reset your password to continue.",
//       });
//     }

//     if (user.isLocked || user.failedLoginAttempts > 0) {
//       user.failedLoginAttempts = 0;
//       user.lockUntil = undefined;
//       await user.save();
//     }

//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       token: token,
//       userData: user,
//       message: "User logged in successfully.",
//       isAdmin: user.isAdmin,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error. Please try again later.",
//     });
//   }
// };

const forgotPassword = async (req, res) => {
  try {
    const sanitizedEmail = xss(req.body.email);
    const user = await Users.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    if (user.is_verified === 0) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    const resetPasswordToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${process.env.FRONTEND_BASE_URL || "https://localhost:3000"}/password/reset/${resetPasswordToken}`;
    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    await transporter.sendMail({
      to: sanitizedEmail,
      subject: "Reset Password",
      text: message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${sanitizedEmail}`,
    });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send reset email. Please try again later.",
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await Users.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    const sanitizedPassword = xss(req.body.password);

    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

    if (sanitizedPassword.length < 8 ) {
      return res.status(400).json({
        success: false,
        message: "Password must be minimum 8 characters long.",
      });
    } else if (!complexityRegex.test(sanitizedPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must include uppercase, lowercase, number, and special character.",
      });
    }

    for (let entry of user.passwordHistory) {
      const isReusedPassword = await bcrypt.compare(sanitizedPassword, entry.password);
      if (isReusedPassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as any of the recent passwords.",
        });
      }
    }

    await user.updatePassword(sanitizedPassword);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const updateUserData = async (req, res) => {
  const sanitizedData = {
    firstName: xss(req.body.firstName),
    lastName: xss(req.body.lastName),
    email: xss(req.body.email),
    contactNumber: xss(req.body.contactNumber),
    address: xss(req.body.address),
    avatar: req.body.avatar ? xss(req.body.avatar) : null
  };

  const userId = req.params.id;

  try {
    let avatarUrl = null;
    if (req.files && req.files.avatar) {
      const { avatar } = req.files;
      const uploadedAvatar = await cloudinary.uploader.upload(avatar.path, {
        folder: "avatars",
      });
      if (!uploadedAvatar || !uploadedAvatar.secure_url) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload avatar to Cloudinary",
        });
      }
      avatarUrl = uploadedAvatar.secure_url;
    } else if (typeof req.body.avatar === "string") {
      avatarUrl = xss(req.body.avatar);
    }

    await Users.findByIdAndUpdate(userId, {
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      contactNumber: sanitizedData.contactNumber,
      address: sanitizedData.address,
      avatar: avatarUrl,
    });

    const user = await Users.findById(userId);

    res.json({
      success: true,
      message: "User profile updated successfully",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateUser = async (req, res) => {
  const sanitizedData = {
    oldEmail: xss(req.body.oldEmail),
    newEmail: xss(req.body.newEmail),
    password: xss(req.body.password),
    firstName: xss(req.body.firstName),
    lastName: xss(req.body.lastName),
    address: xss(req.body.address),
    contactNumber: xss(req.body.contactNumber),
    avatar: req.body.avatar ? xss(req.body.avatar) : null
  };

  try {
    let avatarUrl = null;
    if (req.files && req.files.avatar) {
      const { avatar } = req.files;
      const uploadedAvatar = await cloudinary.uploader.upload(avatar.path, { folder: 'avatars' });
      if (!uploadedAvatar || !uploadedAvatar.secure_url) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload avatar to Cloudinary',
        });
      }
      avatarUrl = uploadedAvatar.secure_url;
    } else if (typeof req.body.avatar === 'string') {
      avatarUrl = xss(req.body.avatar);
    }
    const user = await Users.findOne({ email: sanitizedData.oldEmail });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (sanitizedData.password) {
      const hashedPassword = await bcrypt.hash(sanitizedData.password, 10);
      user.password = hashedPassword;
    }

    user.email = sanitizedData.newEmail || user.email;
    user.firstName = sanitizedData.firstName || user.firstName;
    user.lastName = sanitizedData.lastName || user.lastName;
    user.address = sanitizedData.address || user.address;
    user.contactNumber = sanitizedData.contactNumber || user.contactNumber;
    user.avatar = avatarUrl || user.avatar;

    if (sanitizedData.newEmail && sanitizedData.newEmail !== sanitizedData.oldEmail) {
      const existingUser = await Users.findOne({ email: sanitizedData.newEmail });
      if (existingUser && !existingUser._id.equals(user._id)) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (req.body.isAdmin !== undefined) {
      user.isAdmin = req.body.isAdmin;
    }

    await user.save();
    console.log("User data updated successfully");

    const userData = await Users.findOne({ email: user.email });

    return res.json({
      success: true,
      message: "User data updated successfully",
      userData: userData,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user data",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const sanitizedOldPassword = xss(oldPassword);
    const sanitizedNewPassword = xss(newPassword);
    const { userId } = req.params;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    const isMatch = await bcrypt.compare(sanitizedOldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }
    for (let entry of user.passwordHistory) {
      const isReusedPassword = await bcrypt.compare(sanitizedNewPassword, entry.password);
      if (isReusedPassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as any of the recent passwords.",
        });
      }
    }
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

    if (sanitizedNewPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be minimum 8 characters long.",
      });
    } else if (!complexityRegex.test(sanitizedNewPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must include uppercase, lowercase, number, and special character.",
      });
    }
    await user.updatePassword(sanitizedNewPassword);
    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  verifyMail,
  forgotPassword,
  resetPassword,
  updateUserData,
  updateUser,
  changePassword,checkPasswordStrength
};
