import {
  Alert,
  Badge,
  Box,
  Button,
  ChakraProvider,
  Checkbox,
  Container,
  defaultSystem,
  Flex,
  Heading,
  HStack,
  Input,
  Switch,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Copy, Plus, Settings, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useState, type JSX } from "react";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";

// Types
interface FileType {
  extension: string;
  enabled: boolean;
  mimeTypes: string[];
}

interface CustomFileType {
  id: string;
  extension: string;
  mimeType: string;
}

interface ExclusionRule {
  id: string;
  pattern: string;
  enabled: boolean;
}

// Constants
const DEFAULT_FILE_TYPES: FileType[] = [
  { extension: ".txt", enabled: true, mimeTypes: ["text/plain"] },
  {
    extension: ".js",
    enabled: true,
    mimeTypes: ["application/javascript", "text/javascript"],
  },
  { extension: ".ts", enabled: true, mimeTypes: ["text/typescript"] },
  { extension: ".jsx", enabled: true, mimeTypes: ["text/jsx"] },
  { extension: ".tsx", enabled: true, mimeTypes: ["text/tsx"] },
  { extension: ".css", enabled: true, mimeTypes: ["text/css"] },
  { extension: ".json", enabled: true, mimeTypes: ["application/json"] },
  { extension: ".md", enabled: true, mimeTypes: ["text/markdown"] },
  { extension: ".py", enabled: true, mimeTypes: ["text/x-python"] },
  { extension: ".java", enabled: true, mimeTypes: ["text/x-java-source"] },
  { extension: ".cpp", enabled: true, mimeTypes: ["text/x-c++src"] },
  { extension: ".c", enabled: true, mimeTypes: ["text/x-csrc"] },
  { extension: ".php", enabled: true, mimeTypes: ["text/x-php"] },
  { extension: ".rb", enabled: true, mimeTypes: ["text/x-ruby"] },
  { extension: ".go", enabled: true, mimeTypes: ["text/x-go"] },
  { extension: ".rs", enabled: true, mimeTypes: ["text/x-rust"] },
  { extension: ".swift", enabled: true, mimeTypes: ["text/x-swift"] },
  { extension: ".kt", enabled: true, mimeTypes: ["text/x-kotlin"] },
  { extension: ".scala", enabled: true, mimeTypes: ["text/x-scala"] },
  { extension: ".html", enabled: true, mimeTypes: ["text/html"] },
  {
    extension: ".xml",
    enabled: true,
    mimeTypes: ["text/xml", "application/xml"],
  },
  { extension: ".yml", enabled: true, mimeTypes: ["text/yaml"] },
  { extension: ".yaml", enabled: true, mimeTypes: ["text/yaml"] },
  { extension: ".toml", enabled: true, mimeTypes: ["text/x-toml"] },
  { extension: ".ini", enabled: true, mimeTypes: ["text/plain"] },
  { extension: ".conf", enabled: true, mimeTypes: ["text/plain"] },
  { extension: ".sh", enabled: true, mimeTypes: ["text/x-shellscript"] },
  { extension: ".bat", enabled: true, mimeTypes: ["text/plain"] },
  { extension: ".ps1", enabled: true, mimeTypes: ["text/plain"] },
  { extension: ".sql", enabled: true, mimeTypes: ["text/x-sql"] },
];

const DEFAULT_EXCLUSION_RULES: ExclusionRule[] = [
  { id: "1", pattern: "*.test.*", enabled: true },
  { id: "2", pattern: "*.spec.*", enabled: true },
  { id: "3", pattern: "node_modules/*", enabled: true },
  { id: "4", pattern: ".git/*", enabled: true },
];

const STORAGE_KEYS = {
  FILE_TYPES: "fileCombiner_fileTypes",
  CUSTOM_FILE_TYPES: "fileCombiner_customFileTypes",
  EXCLUSION_RULES: "fileCombiner_exclusionRules",
  INCLUDE_FILE_NAMES: "fileCombiner_includeFileNames",
  INCLUDE_TIMESTAMP: "fileCombiner_includeTimestamp",
  ENABLE_PREPROCESSING: "fileCombiner_enablePreprocessing",
} as const;

// Utility functions
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("Failed to save to localStorage");
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    console.warn("Failed to load from localStorage");
    return defaultValue;
  }
};

// Custom Components
const CustomSwitch = ({
  checked,
  onCheckedChange,
  colorPalette = "teal",
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  colorPalette?: string;
}): JSX.Element => (
  <Switch.Root
    checked={checked}
    onCheckedChange={(details) => onCheckedChange(Boolean(details.checked))}
    colorPalette={colorPalette}
  >
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.HiddenInput />
  </Switch.Root>
);

const CustomCheckbox = ({
  checked,
  onCheckedChange,
  children,
  colorPalette = "teal",
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
  colorPalette?: string;
}): JSX.Element => (
  <Checkbox.Root
    checked={checked}
    onCheckedChange={(details) => onCheckedChange(Boolean(details.checked))}
    colorPalette={colorPalette}
  >
    <Checkbox.HiddenInput />
    <Checkbox.Control>
      <Checkbox.Indicator />
    </Checkbox.Control>
    <Checkbox.Label>{children}</Checkbox.Label>
  </Checkbox.Root>
);

// Tab Components
const FileTypesTab = ({
  fileTypes,
  onToggleFileType,
  getEnabledFileTypesCount,
}: {
  fileTypes: FileType[];
  onToggleFileType: (extension: string) => void;
  getEnabledFileTypesCount: () => number;
}): JSX.Element => (
  <VStack align="stretch" gap={4}>
    <Alert.Root status="info">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>File Type Configuration</Alert.Title>
        <Alert.Description>
          Enable or disable specific file types. Settings are automatically
          saved and will persist across browser sessions.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>

    <Text fontWeight="bold" color="teal.600">
      Supported File Types ({getEnabledFileTypesCount()} enabled)
    </Text>

    <Box
      maxH="400px"
      overflowY="auto"
      border="1px solid"
      borderColor="gray.200"
      rounded="lg"
      p={4}
    >
      <Flex wrap="wrap" gap={3}>
        {fileTypes.map((fileType) => (
          <CustomCheckbox
            key={fileType.extension}
            checked={fileType.enabled}
            onCheckedChange={() => onToggleFileType(fileType.extension)}
            colorPalette="teal"
          >
            <Badge colorPalette={fileType.enabled ? "teal" : "gray"}>
              {fileType.extension}
            </Badge>
          </CustomCheckbox>
        ))}
      </Flex>
    </Box>
  </VStack>
);

const CustomTypesTab = ({
  customFileTypes,
  newCustomType,
  onNewCustomTypeChange,
  onAddCustomFileType,
  onRemoveCustomFileType,
}: {
  customFileTypes: CustomFileType[];
  newCustomType: { extension: string; mimeType: string };
  onNewCustomTypeChange: (
    field: "extension" | "mimeType",
    value: string
  ) => void;
  onAddCustomFileType: () => void;
  onRemoveCustomFileType: (id: string) => void;
}): JSX.Element => (
  <VStack align="stretch" gap={4}>
    <Alert.Root status="info">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Custom File Types</Alert.Title>
        <Alert.Description>
          Add support for additional file types not included in the default
          list. Your custom types are automatically saved.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>

    <Box border="1px solid" borderColor="gray.200" rounded="lg" p={4}>
      <Text fontWeight="bold" mb={3}>
        Add Custom File Type
      </Text>
      <Flex gap={3} align="end">
        <Box flex="1">
          <Text fontSize="sm" mb={2}>
            Extension
          </Text>
          <Input
            placeholder=".custom"
            value={newCustomType.extension}
            onChange={(e) => onNewCustomTypeChange("extension", e.target.value)}
          />
        </Box>
        <Box flex="2">
          <Text fontSize="sm" mb={2}>
            MIME Type
          </Text>
          <Input
            placeholder="text/plain"
            value={newCustomType.mimeType}
            onChange={(e) => onNewCustomTypeChange("mimeType", e.target.value)}
          />
        </Box>
        <Button
          colorScheme="teal"
          bg="teal.500"
          color="white"
          _hover={{ bg: "teal.600" }}
          onClick={onAddCustomFileType}
        >
          <Plus size={16} />
          Add
        </Button>
      </Flex>
    </Box>

    {customFileTypes.length > 0 && (
      <Box>
        <Text fontWeight="bold" mb={3}>
          Custom Types ({customFileTypes.length})
        </Text>
        <VStack align="stretch" gap={2}>
          {customFileTypes.map((customType) => (
            <Flex
              key={customType.id}
              justify="space-between"
              align="center"
              p={3}
              border="1px solid"
              borderColor="gray.200"
              rounded="lg"
            >
              <HStack gap={3}>
                <Badge colorPalette="blue">{customType.extension}</Badge>
                <Text fontSize="sm" color="gray.600">
                  {customType.mimeType}
                </Text>
              </HStack>
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                borderColor="red.400"
                color="red.700"
                bg="white"
                _hover={{
                  bg: "red.50",
                  borderColor: "red.600",
                  color: "red.900",
                }}
                onClick={() => onRemoveCustomFileType(customType.id)}
              >
                <X size={16} />
              </Button>
            </Flex>
          ))}
        </VStack>
      </Box>
    )}
  </VStack>
);

const ExclusionRulesTab = ({
  exclusionRules,
  newExclusionPattern,
  onNewExclusionPatternChange,
  onAddExclusionRule,
  onRemoveExclusionRule,
  onToggleExclusionRule,
  getActiveExclusionRulesCount,
}: {
  exclusionRules: ExclusionRule[];
  newExclusionPattern: string;
  onNewExclusionPatternChange: (value: string) => void;
  onAddExclusionRule: () => void;
  onRemoveExclusionRule: (id: string) => void;
  onToggleExclusionRule: (id: string) => void;
  getActiveExclusionRulesCount: () => number;
}): JSX.Element => (
  <VStack align="stretch" gap={4}>
    <Alert.Root status="warning">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>File Exclusion Rules</Alert.Title>
        <Alert.Description>
          Define patterns to exclude specific files. Use * as wildcard. Example:
          *.test.* excludes test files. Rules are saved automatically.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>

    <Box border="1px solid" borderColor="gray.200" rounded="lg" p={4}>
      <Text fontWeight="bold" mb={3}>
        Add Exclusion Rule
      </Text>
      <Flex gap={3} align="end">
        <Box flex="1">
          <Text fontSize="sm" mb={2}>
            Pattern
          </Text>
          <Input
            placeholder="*.test.*"
            value={newExclusionPattern}
            onChange={(e) => onNewExclusionPatternChange(e.target.value)}
          />
        </Box>
        <Button
          colorScheme="orange"
          bg="orange.400"
          color="white"
          _hover={{ bg: "orange.500" }}
          onClick={onAddExclusionRule}
        >
          <Plus size={16} />
          Add Rule
        </Button>
      </Flex>
    </Box>

    <Box>
      <Text fontWeight="bold" mb={3}>
        Exclusion Rules ({getActiveExclusionRulesCount()} active)
      </Text>
      <VStack align="stretch" gap={2}>
        {exclusionRules.map((rule) => (
          <Flex
            key={rule.id}
            justify="space-between"
            align="center"
            p={3}
            border="1px solid"
            borderColor="gray.200"
            rounded="lg"
            bg={rule.enabled ? "orange.50" : "gray.50"}
          >
            <HStack gap={3}>
              <CustomSwitch
                checked={rule.enabled}
                onCheckedChange={() => onToggleExclusionRule(rule.id)}
                colorPalette="orange"
              />
              <Badge colorPalette={rule.enabled ? "orange" : "gray"}>
                {rule.pattern}
              </Badge>
            </HStack>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              borderColor="red.400"
              color="red.700"
              bg="white"
              _hover={{
                bg: "red.50",
                borderColor: "red.600",
                color: "red.900",
              }}
              onClick={() => onRemoveExclusionRule(rule.id)}
            >
              <X size={16} />
            </Button>
          </Flex>
        ))}
      </VStack>
    </Box>
  </VStack>
);

const ProcessingOptionsTab = ({
  includeFileNames,
  includeTimestamp,
  enablePreprocessing,
  onIncludeFileNamesChange,
  onIncludeTimestampChange,
  onEnablePreprocessingChange,
}: {
  includeFileNames: boolean;
  includeTimestamp: boolean;
  enablePreprocessing: boolean;
  onIncludeFileNamesChange: (checked: boolean) => void;
  onIncludeTimestampChange: (checked: boolean) => void;
  onEnablePreprocessingChange: (checked: boolean) => void;
}): JSX.Element => (
  <VStack align="stretch" gap={6}>
    <Alert.Root status="info">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>File Processing Options</Alert.Title>
        <Alert.Description>
          Configure how files are processed and formatted when combined. Your
          preferences are automatically saved.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>

    <Flex align="center" justify="space-between">
      <Box flex="1">
        <Text fontWeight="medium">Include File Names</Text>
        <Text fontSize="sm" color="gray.600">
          Add file names as comments before each file's content
        </Text>
      </Box>
      <CustomSwitch
        checked={includeFileNames}
        onCheckedChange={onIncludeFileNamesChange}
        colorPalette="teal"
      />
    </Flex>

    <Box h="1px" bg="gray.200" />

    <Flex align="center" justify="space-between">
      <Box flex="1">
        <Text fontWeight="medium">Include Timestamps</Text>
        <Text fontSize="sm" color="gray.600">
          Add timestamps to file headers showing when they were processed
        </Text>
      </Box>
      <CustomSwitch
        checked={includeTimestamp}
        onCheckedChange={onIncludeTimestampChange}
        colorPalette="teal"
      />
    </Flex>

    <Box h="1px" bg="gray.200" />

    <Flex align="center" justify="space-between">
      <Box flex="1">
        <Text fontWeight="medium">Enable Preprocessing</Text>
        <Text fontSize="sm" color="gray.600">
          Remove excessive whitespace and normalize line endings
        </Text>
      </Box>
      <CustomSwitch
        checked={enablePreprocessing}
        onCheckedChange={onEnablePreprocessingChange}
        colorPalette="teal"
      />
    </Flex>
  </VStack>
);

// Settings Modal Component
const SettingsModal = ({
  open,
  onClose,
  fileTypes,
  customFileTypes,
  exclusionRules,
  newCustomType,
  newExclusionPattern,
  includeFileNames,
  includeTimestamp,
  enablePreprocessing,
  onToggleFileType,
  onAddCustomFileType,
  onRemoveCustomFileType,
  onAddExclusionRule,
  onRemoveExclusionRule,
  onToggleExclusionRule,
  onResetToDefaults,
  onNewCustomTypeChange,
  onNewExclusionPatternChange,
  onIncludeFileNamesChange,
  onIncludeTimestampChange,
  onEnablePreprocessingChange,
  getEnabledFileTypesCount,
  getActiveExclusionRulesCount,
}: {
  open: boolean;
  onClose: () => void;
  fileTypes: FileType[];
  customFileTypes: CustomFileType[];
  exclusionRules: ExclusionRule[];
  newCustomType: { extension: string; mimeType: string };
  newExclusionPattern: string;
  includeFileNames: boolean;
  includeTimestamp: boolean;
  enablePreprocessing: boolean;
  onToggleFileType: (extension: string) => void;
  onAddCustomFileType: () => void;
  onRemoveCustomFileType: (id: string) => void;
  onAddExclusionRule: () => void;
  onRemoveExclusionRule: (id: string) => void;
  onToggleExclusionRule: (id: string) => void;
  onResetToDefaults: () => void;
  onNewCustomTypeChange: (
    field: "extension" | "mimeType",
    value: string
  ) => void;
  onNewExclusionPatternChange: (value: string) => void;
  onIncludeFileNamesChange: (checked: boolean) => void;
  onIncludeTimestampChange: (checked: boolean) => void;
  onEnablePreprocessingChange: (checked: boolean) => void;
  getEnabledFileTypesCount: () => number;
  getActiveExclusionRulesCount: () => number;
}): JSX.Element => {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!open) return <></>;

  const tabComponents = [
    <FileTypesTab
      key="file-types"
      fileTypes={fileTypes}
      onToggleFileType={onToggleFileType}
      getEnabledFileTypesCount={getEnabledFileTypesCount}
    />,
    <CustomTypesTab
      key="custom-types"
      customFileTypes={customFileTypes}
      newCustomType={newCustomType}
      onNewCustomTypeChange={onNewCustomTypeChange}
      onAddCustomFileType={onAddCustomFileType}
      onRemoveCustomFileType={onRemoveCustomFileType}
    />,
    <ExclusionRulesTab
      key="exclusion-rules"
      exclusionRules={exclusionRules}
      newExclusionPattern={newExclusionPattern}
      onNewExclusionPatternChange={onNewExclusionPatternChange}
      onAddExclusionRule={onAddExclusionRule}
      onRemoveExclusionRule={onRemoveExclusionRule}
      onToggleExclusionRule={onToggleExclusionRule}
      getActiveExclusionRulesCount={getActiveExclusionRulesCount}
    />,
    <ProcessingOptionsTab
      key="processing-options"
      includeFileNames={includeFileNames}
      includeTimestamp={includeTimestamp}
      enablePreprocessing={enablePreprocessing}
      onIncludeFileNamesChange={onIncludeFileNamesChange}
      onIncludeTimestampChange={onIncludeTimestampChange}
      onEnablePreprocessingChange={onEnablePreprocessingChange}
    />,
  ];

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
    >
      <Box
        bg="white"
        rounded="2xl"
        shadow="2xl"
        maxW="6xl"
        w="full"
        maxH="90vh"
        overflowY="auto"
        mx={4}
      >
        <Flex
          justify="space-between"
          align="center"
          p={6}
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Heading size="lg">Advanced Settings</Heading>
          <Button
            variant="outline"
            colorScheme="teal"
            borderColor="teal.400"
            color="teal.700"
            bg="white"
            _hover={{
              bg: "teal.50",
              borderColor: "teal.600",
              color: "teal.900",
            }}
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </Flex>

        <Box p={6}>
          {/* Tab Navigation */}
          <Flex gap={4} mb={6} borderBottom="1px solid" borderColor="gray.200">
            {[
              "File Types",
              "Custom Types",
              "Exclusion Rules",
              "Processing Options",
            ].map((tab, index) => (
              <Button
                key={tab}
                variant={activeTab === index ? "solid" : "outline"}
                colorScheme={activeTab === index ? "teal" : "gray"}
                borderColor={activeTab === index ? "teal.500" : "gray.400"}
                color={activeTab === index ? "white" : "gray.700"}
                bg={activeTab === index ? "teal.500" : "white"}
                _hover={
                  activeTab === index
                    ? { bg: "teal.600" }
                    : { bg: "gray.100", borderColor: "gray.600" }
                }
                onClick={() => setActiveTab(index)}
                pb={2}
              >
                {tab}
              </Button>
            ))}
          </Flex>

          {/* Tab Content */}
          {tabComponents[activeTab]}
        </Box>

        <Flex
          justify="space-between"
          p={6}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          <Button
            variant="outline"
            colorScheme="teal"
            borderColor="teal.400"
            color="teal.700"
            bg="white"
            _hover={{
              bg: "teal.50",
              borderColor: "teal.600",
              color: "teal.900",
            }}
            onClick={onResetToDefaults}
          >
            Reset to Defaults
          </Button>
          <Button
            colorScheme="teal"
            bg="teal.500"
            color="white"
            _hover={{ bg: "teal.600" }}
            onClick={onClose}
          >
            Apply Settings
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

// Header Component
const AppHeader = ({
  fileCount,
  onOpenSettings,
}: {
  fileCount: number;
  onOpenSettings: () => void;
}): JSX.Element => (
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
            <Settings size={18} />
          </Box>
          <Box>
            <Heading size="lg" fontWeight="bold">
              File Combiner
            </Heading>
            <Text fontSize="sm" opacity={0.9}>
              Drag, drop, and combine your files with ease
            </Text>
          </Box>
        </HStack>
        <HStack gap={4}>
          <Button
            variant="solid"
            colorScheme="teal"
            bg="teal.500"
            color="white"
            _hover={{ bg: "teal.600" }}
            onClick={onOpenSettings}
          >
            <Settings size={18} />
            Settings
          </Button>
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
);

// Drop Zone Component
const FileDropZone = ({
  getRootProps,
  getInputProps,
  isDragActive,
  getEnabledFileTypesCount,
  getActiveExclusionRulesCount,
}: {
  getRootProps: () => React.HTMLProps<HTMLInputElement>;
  getInputProps: () => React.HTMLProps<HTMLInputElement>;
  isDragActive: boolean;
  getEnabledFileTypesCount: () => number;
  getActiveExclusionRulesCount: () => number;
}): JSX.Element => (
  <Box flex="1">
    <div {...getRootProps()}>
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
            {isDragActive ? "Drop your files here!" : "Drag & Drop Files"}
          </Heading>
          <Text
            fontSize="md"
            color="gray.600"
            textAlign="center"
            fontWeight="medium"
          >
            or click anywhere to browse
          </Text>
          <VStack gap={2}>
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
                {getEnabledFileTypesCount()} file types enabled
              </Text>
            </Box>
            {getActiveExclusionRulesCount() > 0 && (
              <Box
                bg="orange.50"
                px={4}
                py={2}
                rounded="xl"
                border="1px solid"
                borderColor="orange.200"
              >
                <Text
                  fontSize="xs"
                  color="orange.600"
                  textAlign="center"
                  fontWeight="medium"
                >
                  {getActiveExclusionRulesCount()} exclusion rules active
                </Text>
              </Box>
            )}
          </VStack>
        </VStack>
      </Box>
    </div>
  </Box>
);

// Editor Component
const FileEditor = ({
  content,
  setContent,
  fileCount,
  onCopy,
  onClear,
}: {
  content: string;
  setContent: (content: string) => void;
  fileCount: number;
  onCopy: () => void;
  onClear: () => void;
}): JSX.Element => (
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
            variant="outline"
            colorScheme="gray"
            borderColor="gray.400"
            color="gray.700"
            rounded="xl"
            size="sm"
            shadow="sm"
            _hover={{
              bg: "gray.100",
              borderColor: "gray.600",
              shadow: "md",
              transform: "translateY(-1px)",
            }}
            transition="all 0.2s ease"
            onClick={onClear}
          >
            Clear All
          </Button>
        )}
        <Button
          colorScheme="teal"
          variant="solid"
          onClick={onCopy}
          rounded="xl"
          shadow="lg"
          _hover={{
            shadow: "xl",
            transform: "translateY(-1px)",
            bg: "teal.600",
          }}
          transition="all 0.2s ease"
          fontWeight="semibold"
        >
          <Copy size={18} />
          Copy All
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
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            Files:{" "}
            <Text as="span" color="teal.600" fontWeight="bold">
              {fileCount}
            </Text>
          </Text>
        </HStack>
        <Text fontSize="xs" color="gray.400">
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
      </Flex>
    )}
  </Flex>
);

// Footer Component
const AppFooter = (): JSX.Element => (
  <Box bg="gray.900" color="white" py={6} mt="auto">
    <Container maxW="7xl">
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" color="gray.400">
          © 2025 Advanced File Combiner. Built with ❤️ using React & Chakra UI
          v3
        </Text>
        <HStack gap={3}>
          <Text fontSize="sm" color="gray.400">
            Enhanced with advanced filtering & customization
          </Text>
        </HStack>
      </Flex>
    </Container>
  </Box>
);

// Custom Hook for file operations
const useFileOperations = () => {
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [customFileTypes, setCustomFileTypes] = useState<CustomFileType[]>([]);
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [includeFileNames, setIncludeFileNames] = useState<boolean>(true);
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(false);
  const [enablePreprocessing, setEnablePreprocessing] =
    useState<boolean>(false);

  const getAcceptObject = useCallback((): Record<string, string[]> => {
    const accept: Record<string, string[]> = {};

    fileTypes.forEach((fileType) => {
      if (fileType.enabled) {
        fileType.mimeTypes.forEach((mimeType) => {
          if (!accept[mimeType]) {
            accept[mimeType] = [];
          }
          accept[mimeType].push(fileType.extension);
        });
      }
    });

    customFileTypes.forEach((customType) => {
      if (!accept[customType.mimeType]) {
        accept[customType.mimeType] = [];
      }
      accept[customType.mimeType].push(customType.extension);
    });

    return accept;
  }, [fileTypes, customFileTypes]);

  const isFileExcluded = useCallback(
    (fileName: string): boolean => {
      return exclusionRules.some((rule) => {
        if (!rule.enabled) return false;
        const pattern = rule.pattern.replace(/\*/g, ".*");
        const regex = new RegExp(`^${pattern}$`, "i");
        return regex.test(fileName);
      });
    },
    [exclusionRules]
  );

  return {
    fileTypes,
    setFileTypes,
    customFileTypes,
    setCustomFileTypes,
    exclusionRules,
    setExclusionRules,
    includeFileNames,
    setIncludeFileNames,
    includeTimestamp,
    setIncludeTimestamp,
    enablePreprocessing,
    setEnablePreprocessing,
    getAcceptObject,
    isFileExcluded,
  };
};

// Main App Component
export default function App(): JSX.Element {
  const [content, setContent] = useState<string>("");
  const [fileCount, setFileCount] = useState<number>(0);
  const [newCustomType, setNewCustomType] = useState<{
    extension: string;
    mimeType: string;
  }>({
    extension: "",
    mimeType: "",
  });
  const [newExclusionPattern, setNewExclusionPattern] = useState<string>("");

  const { open, onOpen, onClose } = useDisclosure();

  const {
    fileTypes,
    setFileTypes,
    customFileTypes,
    setCustomFileTypes,
    exclusionRules,
    setExclusionRules,
    includeFileNames,
    setIncludeFileNames,
    includeTimestamp,
    setIncludeTimestamp,
    enablePreprocessing,
    setEnablePreprocessing,
    getAcceptObject,
    isFileExcluded,
  } = useFileOperations();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadedFileTypes = loadFromStorage(
      STORAGE_KEYS.FILE_TYPES,
      DEFAULT_FILE_TYPES
    );
    const loadedCustomFileTypes = loadFromStorage(
      STORAGE_KEYS.CUSTOM_FILE_TYPES,
      []
    );
    const loadedExclusionRules = loadFromStorage(
      STORAGE_KEYS.EXCLUSION_RULES,
      DEFAULT_EXCLUSION_RULES
    );
    const loadedIncludeFileNames = loadFromStorage(
      STORAGE_KEYS.INCLUDE_FILE_NAMES,
      true
    );
    const loadedIncludeTimestamp = loadFromStorage(
      STORAGE_KEYS.INCLUDE_TIMESTAMP,
      false
    );
    const loadedEnablePreprocessing = loadFromStorage(
      STORAGE_KEYS.ENABLE_PREPROCESSING,
      false
    );

    setFileTypes(loadedFileTypes);
    setCustomFileTypes(loadedCustomFileTypes);
    setExclusionRules(loadedExclusionRules);
    setIncludeFileNames(loadedIncludeFileNames);
    setIncludeTimestamp(loadedIncludeTimestamp);
    setEnablePreprocessing(loadedEnablePreprocessing);

    toast.success("Settings loaded from previous session!");
  }, [
    setFileTypes,
    setCustomFileTypes,
    setExclusionRules,
    setIncludeFileNames,
    setIncludeTimestamp,
    setEnablePreprocessing,
  ]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (fileTypes.length > 0) {
      saveToStorage(STORAGE_KEYS.FILE_TYPES, fileTypes);
    }
  }, [fileTypes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOM_FILE_TYPES, customFileTypes);
  }, [customFileTypes]);

  useEffect(() => {
    if (exclusionRules.length > 0) {
      saveToStorage(STORAGE_KEYS.EXCLUSION_RULES, exclusionRules);
    }
  }, [exclusionRules]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.INCLUDE_FILE_NAMES, includeFileNames);
  }, [includeFileNames]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.INCLUDE_TIMESTAMP, includeTimestamp);
  }, [includeTimestamp]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ENABLE_PREPROCESSING, enablePreprocessing);
  }, [enablePreprocessing]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]): Promise<void> => {
      try {
        let addedCount = 0;

        for (const file of acceptedFiles) {
          if (isFileExcluded(file.name)) {
            toast.error(`Excluded: ${file.name}`);
            continue;
          }

          const text = await file.text();
          let fileContent = text;

          if (enablePreprocessing) {
            fileContent = fileContent.replace(/\n\s*\n\s*\n/g, "\n\n");
          }

          const header = includeFileNames
            ? `// ${file.name}`
            : `// File ${addedCount + 1}`;
          const timestamp = includeTimestamp
            ? ` (${new Date().toISOString()})`
            : "";

          setContent(
            (prev) => prev + `${header}${timestamp}\n` + fileContent + "\n\n"
          );
          addedCount++;
        }

        if (addedCount > 0) {
          setFileCount((prev) => prev + addedCount);
          toast.success(`${addedCount} file(s) added successfully!`);
        }

        if (addedCount !== acceptedFiles.length) {
          toast.error(
            `${acceptedFiles.length - addedCount} file(s) were excluded`
          );
        }
      } catch {
        toast.error("Failed to read file(s)");
      }
    },
    [isFileExcluded, includeFileNames, includeTimestamp, enablePreprocessing]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptObject(),
  });

  const handleCopy = async (): Promise<void> => {
    if (!content.trim()) {
      toast.error("Nothing to copy!");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success("All content copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard!");
    }
  };

  const handleClear = (): void => {
    setContent("");
    setFileCount(0);
    toast.success("Content cleared!");
  };

  const toggleFileType = (extension: string): void => {
    setFileTypes((prev) =>
      prev.map((ft) =>
        ft.extension === extension ? { ...ft, enabled: !ft.enabled } : ft
      )
    );
  };

  const addCustomFileType = (): void => {
    if (!newCustomType.extension || !newCustomType.mimeType) {
      toast.error("Please fill in both extension and MIME type");
      return;
    }

    if (!newCustomType.extension.startsWith(".")) {
      toast.error("Extension must start with a dot (.)");
      return;
    }

    const newType: CustomFileType = {
      id: Date.now().toString(),
      extension: newCustomType.extension,
      mimeType: newCustomType.mimeType,
    };

    setCustomFileTypes((prev) => [...prev, newType]);
    setNewCustomType({ extension: "", mimeType: "" });
    toast.success("Custom file type added!");
  };

  const removeCustomFileType = (id: string): void => {
    setCustomFileTypes((prev) => prev.filter((ct) => ct.id !== id));
    toast.success("Custom file type removed!");
  };

  const addExclusionRule = (): void => {
    if (!newExclusionPattern.trim()) {
      toast.error("Please enter a pattern");
      return;
    }

    const newRule: ExclusionRule = {
      id: Date.now().toString(),
      pattern: newExclusionPattern.trim(),
      enabled: true,
    };

    setExclusionRules((prev) => [...prev, newRule]);
    setNewExclusionPattern("");
    toast.success("Exclusion rule added!");
  };

  const removeExclusionRule = (id: string): void => {
    setExclusionRules((prev) => prev.filter((rule) => rule.id !== id));
    toast.success("Exclusion rule removed!");
  };

  const toggleExclusionRule = (id: string): void => {
    setExclusionRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const resetToDefaults = (): void => {
    setFileTypes(DEFAULT_FILE_TYPES);
    setCustomFileTypes([]);
    setExclusionRules(DEFAULT_EXCLUSION_RULES);
    setIncludeFileNames(true);
    setIncludeTimestamp(false);
    setEnablePreprocessing(false);
    toast.success("Settings reset to defaults!");
  };

  const getEnabledFileTypesCount = (): number => {
    return fileTypes.filter((ft) => ft.enabled).length + customFileTypes.length;
  };

  const getActiveExclusionRulesCount = (): number => {
    return exclusionRules.filter((rule) => rule.enabled).length;
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

      <AppHeader fileCount={fileCount} onOpenSettings={onOpen} />

      <SettingsModal
        open={open}
        onClose={onClose}
        fileTypes={fileTypes}
        customFileTypes={customFileTypes}
        exclusionRules={exclusionRules}
        newCustomType={newCustomType}
        newExclusionPattern={newExclusionPattern}
        includeFileNames={includeFileNames}
        includeTimestamp={includeTimestamp}
        enablePreprocessing={enablePreprocessing}
        onToggleFileType={toggleFileType}
        onAddCustomFileType={addCustomFileType}
        onRemoveCustomFileType={removeCustomFileType}
        onAddExclusionRule={addExclusionRule}
        onRemoveExclusionRule={removeExclusionRule}
        onToggleExclusionRule={toggleExclusionRule}
        onResetToDefaults={resetToDefaults}
        onNewCustomTypeChange={(field, value) =>
          setNewCustomType((prev) => ({ ...prev, [field]: value }))
        }
        onNewExclusionPatternChange={setNewExclusionPattern}
        onIncludeFileNamesChange={setIncludeFileNames}
        onIncludeTimestampChange={setIncludeTimestamp}
        onEnablePreprocessingChange={setEnablePreprocessing}
        getEnabledFileTypesCount={getEnabledFileTypesCount}
        getActiveExclusionRulesCount={getActiveExclusionRulesCount}
      />

      <Box
        bg="linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 50%, #A7F3D0 100%)"
        minH="calc(100vh - 200px)"
        py={8}
      >
        <Container maxW="7xl">
          <Flex direction={{ base: "column", lg: "row" }} gap={8} h="full">
            <FileDropZone
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              getEnabledFileTypesCount={getEnabledFileTypesCount}
              getActiveExclusionRulesCount={getActiveExclusionRulesCount}
            />
            <FileEditor
              content={content}
              setContent={setContent}
              fileCount={fileCount}
              onCopy={handleCopy}
              onClear={handleClear}
            />
          </Flex>
        </Container>
      </Box>

      <AppFooter />
    </ChakraProvider>
  );
}
