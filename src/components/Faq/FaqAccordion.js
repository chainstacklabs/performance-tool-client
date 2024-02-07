import React, { useState } from 'react';

const FaqAccordion = () => {
  const [accordions, setAccordion] = useState([
    {
      key: 1,
      title: 'Q?',
      data: `ANSWER`,
      isOpen: false,
    },
    {
      key: 2,
      title: 'Questions?',
      data: `Free Tutorials, Millions of Articles, Live, Online and Classroom Courses.`,
      isOpen: false,
    },
  ]);

  const toggleAccordion = (accordionkey) => {
    const updatedAccordions = accordions.map((accord) => {
      if (accord.key === accordionkey) {
        return { ...accord, isOpen: !accord.isOpen };
      } else {
        return { ...accord, isOpen: false };
      }
    });

    setAccordion(updatedAccordions);
  };

  function Accordion(props) {
    return (
      <div className="border border-gray-700 rounded-xl mb-3">
        <button
          className="w-full px-5 py-6 text-xl text-left transition duration-300 font-medium"
          onClick={props.toggleAccordion}
        >
          {props.title}
          <span
            className={`float-right transform ${
              props.isOpen ? 'rotate-180' : 'rotate-0'
            } transition-transform duration-300`}
          >
            ↓
          </span>
        </button>
        {props.isOpen && <div className="p-4">{props.data}</div>}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-5xl font-bold text-accent text-center">FAQ</h2>
      <div>
        {accordions.map((accordion) => (
          <Accordion
            key={accordion.key}
            title={accordion.title}
            data={accordion.data}
            isOpen={accordion.isOpen}
            toggleAccordion={() => toggleAccordion(accordion.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default FaqAccordion;
