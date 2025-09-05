import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Textarea,
  VStack,
  HStack,
  ChakraProvider,
  defaultSystem,
  Container,
} from "@chakra-ui/react";
import { Copy, UploadCloud, FileText, Github } from "lucide-react";
import { useCallback, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";

export default function App(): JSX.Element {
  const [content, setContent] = useState<string>("");
  const [fileCount, setFileCount] = useState<number>(0);

  const onDrop = useCallback(async (acceptedFiles: File[]): Promise<void> => {
    try {
      for (const file of acceptedFiles) {
        const text = await file.text();
        setContent((prev) => prev + `// ${file.name}\n` + text + "\n\n");
      }
      setFileCount((prev) => prev + acceptedFiles.length);
      toast.success(`${acceptedFiles.length} file(s) added successfully!`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to read file(s)");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [".txt", ".js", ".ts", ".jsx", ".tsx", ".css", ".json", ".md"],
      "application/json": [".json"],
      "application/javascript": [".js"],
      "text/javascript": [".js"],
      "text/typescript": [".ts"],
      "text/jsx": [".jsx"],
      "text/tsx": [".tsx"],
    },
  });

  const handleCopy = async (): Promise<void> => {
    if (!content.trim()) {
      toast.error("Nothing to copy!");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success("All content copied to clipboard!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to copy to clipboard!");
    }
  };

  const handleClear = (): void => {
    setContent("");
    setFileCount(0);
    toast.success("Content cleared!");
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0D9488",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(13, 148, 136, 0.3)",
          },
        }}
      />

      {/* Header */}
      <Box
        bg="linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)"
        color="white"
        py={6}
        shadow="xl"
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <Box bg="white" color="teal.600" p={2} rounded="xl" shadow="lg">
                <FileText size={24} />
              </Box>
              <Box>
                <Heading size="lg" fontWeight="bold">
                  File Combiner
                </Heading>
                <Text fontSize="sm" opacity={0.9}>
                  Drag, drop, and combine your files instantly
                </Text>
              </Box>
            </HStack>
            <HStack gap={4}>
              {fileCount > 0 && (
                <Box
                  bg="whiteAlpha.200"
                  px={3}
                  py={1}
                  rounded="full"
                  backdropFilter="blur(10px)"
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {fileCount} files loaded
                  </Text>
                </Box>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        bg="linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 50%, #A7F3D0 100%)"
        h="100%"
        py={8}
      >
        <Container maxW="7xl">
          <Flex direction={{ base: "column", lg: "row" }} gap={8} h="full">
            {/* Left: Drop zone */}
            <Box flex="1">
              <Box
                border="3px dashed"
                borderColor={isDragActive ? "teal.500" : "teal.300"}
                rounded="3xl"
                bg="white"
                shadow="2xl"
                _hover={{
                  shadow: "3xl",
                  borderColor: "teal.500",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                minH="500px"
                position="relative"
                overflow="hidden"
                {...getRootProps()}
              >
                <input {...getInputProps()} />

                {/* Background Pattern */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  opacity={0.05}
                  bgImage="radial-gradient(circle at 25px 25px, #0D9488 2px, transparent 0), radial-gradient(circle at 75px 75px, #0D9488 2px, transparent 0)"
                  bgSize="100px 100px"
                />

                <VStack gap={6} zIndex={1}>
                  <Box
                    bg="linear-gradient(135deg, #0D9488, #14B8A6)"
                    p={4}
                    rounded="2xl"
                    shadow="xl"
                    transform={isDragActive ? "scale(1.1)" : "scale(1)"}
                    transition="transform 0.3s ease"
                  >
                    <UploadCloud size={48} color="white" />
                  </Box>
                  <Heading
                    size="lg"
                    color="teal.700"
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {isDragActive
                      ? "Drop your files here!"
                      : "Drag & Drop Files"}
                  </Heading>
                  <Text
                    fontSize="md"
                    color="gray.600"
                    textAlign="center"
                    fontWeight="medium"
                  >
                    or click anywhere to browse
                  </Text>
                  <Box
                    bg="gray.50"
                    px={4}
                    py={2}
                    rounded="xl"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textAlign="center"
                      fontWeight="medium"
                    >
                      Supports: TXT, JS, TS, JSX, TSX, CSS, JSON, MD
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </Box>

            {/* Right: Editor */}
            <Flex
              flex="2"
              direction="column"
              gap={4}
              bg="white"
              p={6}
              rounded="3xl"
              shadow="2xl"
              border="1px solid"
              borderColor="gray.100"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <Box>
                  <Heading size="lg" color="gray.800" fontWeight="bold">
                    Combined Content
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    Edit, review, and copy your combined files
                  </Text>
                </Box>
                <HStack gap={3}>
                  {content && (
                    <Button
                      color="white"
                      colorScheme="red"
                      variant="outline"
                      onClick={handleClear}
                      rounded="xl"
                      size="sm"
                      shadow="sm"
                      _hover={{ shadow: "md", transform: "translateY(-1px)" }}
                      transition="all 0.2s ease"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    colorScheme="teal"
                    variant="solid"
                    onClick={handleCopy}
                    rounded="xl"
                    shadow="lg"
                    _hover={{
                      shadow: "xl",
                      transform: "translateY(-1px)",
                      bg: "teal.600",
                    }}
                    // isDisabled={!content.trim()}
                    transition="all 0.2s ease"
                    fontWeight="semibold"
                  >
                    <Copy size={18} />
                    <Text ml={2}>Copy All</Text>
                  </Button>
                </HStack>
              </Flex>

              <Textarea
                flex="1"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your combined file content will appear here... ✨"
                fontFamily="'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
                fontSize="sm"
                p={4}
                borderColor="gray.200"
                rounded="xl"
                shadow="inner"
                resize="none"
                minH="400px"
                bg="gray.50"
                _focus={{
                  borderColor: "teal.400",
                  shadow: "0 0 0 3px rgba(13, 148, 136, 0.1)",
                  bg: "white",
                }}
                transition="all 0.2s ease"
              />

              {content && (
                <Flex justify="space-between" align="center">
                  <HStack gap={4}>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Characters:{" "}
                      <Text as="span" color="teal.600" fontWeight="bold">
                        {content.length.toLocaleString()}
                      </Text>
                    </Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Lines:{" "}
                      <Text as="span" color="teal.600" fontWeight="bold">
                        {content.split("\n").length.toLocaleString()}
                      </Text>
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" color="white" py={6} mt="auto">
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="gray.400">
              © 2025 File Combiner. Built with ❤️ using React & Chakra UI
            </Text>
            <HStack gap={4}>
              <Text fontSize="sm" color="gray.400">
                Made for developers, by developers
              </Text>
              <Github size={16} color="#9CA3AF" />
            </HStack>
          </Flex>
        </Container>
      </Box>
    </ChakraProvider>
  );
}
