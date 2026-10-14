import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-9xl font-extrabold text-gray-200 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary px-6 py-3 rounded-xl gap-2">
        <Home className="h-5 w-5" />
        Back to Home
      </Link>
    </div>
  );
}
