import { Link } from "react-router-dom"
import { ThemeToggle } from "../theme-toggle"

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary text-center p-6">
	  <div className="absolute top-4 right-4">
		<ThemeToggle />
	  </div>
      <div className="relative">
        {/* Animated 404 */}
        <h1 className="text-[8rem] font-extrabold text-primary dark:text-accent">
          404
        </h1>
      </div>

      <p className="mt-6 text-lg text-text-secondary">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      <Link
        to="/"
        className="mt-8 px-6 py-3 rounded-xl bg-primary text-accent font-semibold hover:bg-primary-hover transition-all duration-300 animate-fadeInUp"
      >
        Go Home
      </Link>

      {/* Optional animated shadow or accent circle */}
      <div className="absolute bottom-12 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse" />

    </div>
  )
}
