import { render, screen } from "@testing-library/react";
import Login from "./components/Login";

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => jest.fn()
  }),
  { virtual: true }
);

jest.mock("./services/api", () => ({
  loginUser: jest.fn()
}));

test("renders the login screen", () => {
  render(<Login />);

  expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/2451-xx-xxx-xxx/i)).toBeInTheDocument();
});
