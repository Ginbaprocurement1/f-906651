import { Button } from "./ui/button";

export const Footer = () => {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-2">
              <li>Email: contact@company.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Construction St.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">About Us</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-secondary">Our Story</a></li>
              <li><a href="#" className="hover:text-secondary">Careers</a></li>
              <li><a href="#" className="hover:text-secondary">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Are you a Supplier?</h3>
            <Button variant="secondary">Join Us</Button>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Products & Solutions</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-secondary">Construction Materials</a></li>
              <li><a href="#" className="hover:text-secondary">Tools & Equipment</a></li>
              <li><a href="#" className="hover:text-secondary">Professional Services</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};