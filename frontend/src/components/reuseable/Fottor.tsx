const Footer = () => {
  return (
    <footer className="bg-white border-t mt-4 px-6 py-4 text-center text-sm text-gray-500">
      <p>
        © {new Date().getFullYear()} bilgo.ai — Built for the Property VoiceBot Challenge
      </p>
    </footer>
  );
};

export default Footer;
