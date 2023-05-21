import { useEffect, useState } from "react";

export const useSchema = (defaultValue, fileName) => {
  const [schema, setSchema] = useState(defaultValue);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        // Make an API call or perform any logic to fetch the schema
        // from the JSON file and update the state with the fetched schema
        const response = await fetch(`../json/${fileName}.json`);
        const data = await response.json();
        setSchema(data);
      } catch (error) {
        // Handle any errors that occur during the fetch
        console.error("Error fetching schema:", error);
      }
    };

    // Call the fetchSchema function
    fetchSchema();
  }, [fileName]);

  const array = Object.values(schema);

  return Array.isArray(array) ? schema : [];
};

