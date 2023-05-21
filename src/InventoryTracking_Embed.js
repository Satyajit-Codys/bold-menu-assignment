import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Flex,
  Box,
  Text,
  ButtonGroup,
  Heading,
  Button,
  Select,
  FormLabel,
  VStack,
  Divider,
  useDisclosure,
  AlertIcon,
  Alert,
  GridItem,
  Grid,
} from "@chakra-ui/react";
import { Link as ReachLink } from "react-router-dom";
import React, { useMemo } from "react";
import { useState } from "react";
import ReactEcharts from "echarts-for-react";
import {
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";
// import Reports from "./Reports/Reports";

import { DownloadIcon } from "@chakra-ui/icons";
import { saveAs } from "file-saver";
import {
  GET_STATUS_ALL,
  GET_ATTRIBUTE_ALL,
  GET_ROUTE_STATUS_ATTRIBUTE,
} from "../src/components/fetchDataFromJson.js";

const InventoryTracking_Embed = () => {
  const statusTable = GET_STATUS_ALL();
  const attributeTable = GET_ATTRIBUTE_ALL();
  const routeTable = GET_ROUTE_STATUS_ATTRIBUTE();

  // console.log(statusTable, attributeTable,routeTable);

  const { loading, data, refetch } = statusTable;
  const { loading: aLoading, data: aData } = attributeTable;

  // code for status and attribute form submission

  const [statusId, setStatusId] = useState("");
  const [attributeId, setAttributeId] = useState("");

  const handleStatusChange = (event) => {
    setStatusId(event.target.value);
  };

  const handleAttributeChange = (event) => {
    setAttributeId(event.target.value);
  };

  const handleRefineClick = () => {
    // Call the refetch function to trigger the query with the new variables
    console.log("refine- clicked");
    qrefetch();
    console.log(qdata, "qdata");
  };

  // end code for status and attribute submission

  const {
    loading: qloading,
    data: qdata,
    refetch: qrefetch,
  } = (routeTable,
  {
    variables: {
      status: statusId,
      attribute: attributeId,
    },
  });

  console.log(data, "data");
  console.log(aData, "aData");
  console.log(qdata, "qdata");

  //   const { isOpen, onOpen, onClose } = useDisclosure();
  //   const btnRef = React.useRef();

  const items = useMemo(() => {
    if (!loading && !!data) {
      return data[statusTable];
    }
    return [];
  }, [loading, data]);

  const AttItems = useMemo(() => {
    if (!aLoading && !!aData) {
      return aData[attributeTable];
    }
    return [];
  }, [aLoading, aData]);

  console.log("items", items);
  console.log("AttItems", AttItems);

  // code for table
  const tableItems = useMemo(() => {
    if (!qloading && !!qdata) {
      return qdata[routeTable];
    }
    return [];
  }, [qloading, qdata]);

  const counts = {};
  tableItems.forEach((route) => {
    const variantTitle = route.z_variant_code.title;
    route.z_route_attribute_values.forEach((attr) => {
      if (attr.z_route_attribute.id === attributeId) {
        // check if the attribute id matches
        const attributeName = attr.value.trim();
        if (!counts[variantTitle]) {
          counts[variantTitle] = {};
        }
        if (!counts[variantTitle][attributeName]) {
          counts[variantTitle][attributeName] = 0;
        }
        counts[variantTitle][attributeName]++;
      }
    });
  });

  const products = new Set();
  const productAttributes = new Map();
  if (tableItems && Array.isArray(tableItems, attributeId)) {
    tableItems.forEach((route) => {
      const product = route.z_variant_code.title;
      if (!productAttributes.has(product)) {
        productAttributes.set(product, {});
        products.add(product);
      }
      console.log(
        route.z_route_attribute_values,
        "route.z_route_attribute_values"
      );
      route.z_route_attribute_values.forEach((attr) => {
        const attributeName = attr.value;
        console.log("157", attr.z_route_attribute.id, attributeId);
        if (attr.z_route_attribute.id == attributeId) {
          if (!productAttributes.get(product).hasOwnProperty(attributeName)) {
            productAttributes.get(product)[attributeName] = 0;
          }
          productAttributes.get(product)[attributeName]++;
        }
      });
    });
  }

  const attributes = new Set();

  productAttributes.forEach((value) => {
    Object.keys(value).forEach((key) => {
      attributes.add(key);
    });
  });

  // end code for table
  console.log("productAttributes", productAttributes, attributes);

  // experimental charts visualisation

  const chartData = {
    legend: [...attributes],
    xAxis: [...products],
    series: [...attributes].map((attr) => ({
      name: attr,
      type: "bar",
      stack: "stacked",
      data: [...products].map(
        (product) => productAttributes.get(product)?.[attr] || 0
      ),
    })),
  };

  const isTableEmpty =
    [...products].length === 0 || [...attributes].length === 0;

  // download CSv file

  const handleDownloadCSV = () => {
    // Prepare CSV data
    const csvData = [];

    // Add header row
    const headerRow = ["Product", ...attributes];
    csvData.push(headerRow.join(","));

    // Add data rows
    [...products].forEach((product) => {
      const dataRow = [
        product,
        ...[...attributes].map(
          (attr) => productAttributes.get(product)?.[attr] || 0
        ),
      ];
      csvData.push(dataRow.join(","));
    });

    // Convert CSV data to string
    const csvString = csvData.join("\n");

    // Create Blob object
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });

    // Save file
    saveAs(blob, "inventory_data.csv");
  };

  // json data // we need this back-up

  const jsonStructure = {
    attributes: [...attributes],
    products: [...products],
    data: [],
  };

  [...products].forEach((product) => {
    const rowData = {
      product: product,
      values: {},
    };

    [...attributes].forEach((attr) => {
      const value = productAttributes.get(product)?.[attr] || 0;
      rowData.values[attr] = value;
    });

    jsonStructure.data.push(rowData);
  });

  console.log(JSON.stringify(jsonStructure, null, 2));

  return (
    <>
      <Flex border="0px">
        <Box flex="1" overflowY="auto" minH="100vh">
          <>
            <Flex
              border="0px"
              w="100%"
              justify="space-between"
              alignItems="center"
              mb="5"
            >
              <ButtonGroup></ButtonGroup>
              <ButtonGroup>
                <Select
                  id="status-select"
                  placeholder="Select a status"
                  onChange={handleStatusChange}
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </Select>

                <Select onChange={handleAttributeChange}>
                  {AttItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </Select>

                <Button variant="outline" onClick={handleRefineClick}>
                  Refine
                </Button>
              </ButtonGroup>
            </Flex>
            {!isTableEmpty && (
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <GridItem>
                  <Box
                    display="none"
                    justifyContent="center"
                    boxShadow="xl"
                    p={6}
                    borderRadius="lg"
                  >
                    <Stat display="none">
                      <StatLabel>Collected Fees</StatLabel>
                      <StatNumber fontSize="2xl">£0.00</StatNumber>
                      <StatHelpText>Feb 12 - Feb 28</StatHelpText>
                    </Stat>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box>
                    <ReactEcharts
                      option={{
                        tooltip: {
                          trigger: "axis",
                        },
                        legend: {
                          data: chartData.legend,
                        },
                        xAxis: {
                          type: "category",
                          data: chartData.xAxis,
                        },
                        yAxis: {
                          type: "value",
                        },
                        series: chartData.series,
                      }}
                      style={{ height: "400px" }}
                    />
                  </Box>
                </GridItem>
              </Grid>
            )}
            <Divider />
            {!isTableEmpty && (
              <Box p="5">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={4}
                >
                  <Heading size="sm">title here</Heading>
                  <Button
                    leftIcon={<DownloadIcon />}
                    onClick={handleDownloadCSV}
                  >
                    Download CSV
                  </Button>
                </Box>
                {console.log("products 316", products, attributes)}
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      {[...attributes].map((attr) => (
                        <Th key={attr}>{attr}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {[...products].map((product) => (
                      <Tr key={product}>
                        <Td>{product}</Td>
                        {[...attributes].map((attr) => (
                          <Td key={attr}>
                            {productAttributes.get(product)?.[attr] || 0}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
            {isTableEmpty && (
              <Box>
                <Alert status="info" variant="subtle" mb={4}>
                  <AlertIcon />
                  <Text>
                    No data available. Please select an option or a different
                    option to view the information.
                  </Text>
                </Alert>
              </Box>
            )}

            <Divider />
          </>
        </Box>
      </Flex>
      {/* {isOpen && <Reports btnRef={btnRef} editId={""} refetch={refetch} onClose={onClose} isOpen={isOpen} />} */}
    </>
  );
};

export default InventoryTracking_Embed;
