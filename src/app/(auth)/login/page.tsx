import Form from "next/form";
import Login from "@/app/actions/auth/login";
export default function LoginPage(){
return (
    <Form action={Login}>
        <input name="email" type="email" placeholder="Email" required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit" >Log In</button>

    </Form>
)
}