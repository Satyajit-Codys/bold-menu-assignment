import statusData from "../json/status.json";
import attributeData from "../json/attribute.json";
import routeStatusAttributeData from "../json/route.json";

export const GET_STATUS_ALL = () => {
  return statusData;
};

export const GET_ATTRIBUTE_ALL = () => {
  return attributeData;
};

export const GET_ROUTE_STATUS_ATTRIBUTE = () => {
  return routeStatusAttributeData;
};
