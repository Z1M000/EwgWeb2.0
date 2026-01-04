import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="card my-4 mx-2 ">
      <span className="title">About Us</span>
      <p className="mt-3 mb-4">
        This site tracks the Emory Women’s Golf point system, where players earn
        points from practices, tournaments, and other team activities.
      </p>
      <div className="icon-wrapper px-5">
        <a href="https://docs.google.com/document/d/1pz1OdZDN2u_cPtey3aIq00W0XO1I0jaTAiYnIDFseB8/edit?tab=t.0">
          <img className="icon" src="/rules_icon.png" alt="Point Game Rules" />
        </a>
        <a href="https://www.instagram.com/emorywgolf/">
          <img className="icon" src="/Instagram_icon.png" alt="Instagram" />
        </a>
        <a href="https://emoryathletics.com/sports/womens-golf">
          <img
            className="icon"
            src="/emory_golf_icon.jpg"
            alt="Emory Women's Golf Homepage"
          />
        </a>
      </div>
    </div>
  );
};

export default AboutUs;
