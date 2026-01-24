import Form from "next/form";
import SignUp from "@/app/actions/auth/signup";

export default function SignupPage() {
  return (
    <>
      <Form action={SignUp}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="username" type="text" placeholder="Username" required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit" >Sign Up</button>
      </Form>
    </>
  );
}
