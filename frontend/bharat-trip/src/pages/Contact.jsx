function Contact() {
  return (
    <div className="page">
      <h1>Contact Us</h1>
      <p>We’d love to hear from you.</p>

      <form className="contact-form">
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="5" required />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default Contact;