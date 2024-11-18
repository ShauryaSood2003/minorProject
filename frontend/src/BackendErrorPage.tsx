import React from 'react';

const BackendErrorPage = ({ pingBackend }: { pingBackend: () => void }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 text-center max-w-sm w-full">
        <img
          src="https://via.placeholder.com/150" // Replace with your custom error illustration URL
          alt="Error Illustration"
          className="w-24 mx-auto mb-4"
        />
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Unable to Connect
        </h1>
        <p className="text-gray-600 mb-6">
          We are having trouble communicating with the server. Please check your
          connection or try again later.
        </p>
        <button
          onClick={pingBackend}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default BackendErrorPage;
