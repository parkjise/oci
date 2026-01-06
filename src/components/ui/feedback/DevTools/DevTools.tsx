import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Modal,
  Tabs,
  Typography,
  Space,
  Button,
  Select,
  Input,
  Tag,
  Badge,
} from "antd";
import type { TabsProps } from "antd";
import { CopyOutlined, ClearOutlined } from "@ant-design/icons";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useUiStore } from "@store/com/ui/uiStore";
import { useAuthStore } from "@store/com/auth/authStore";
import {
  StyledDevToolsContent,
  StyledSection,
  StyledCodeBlock,
  StyledButtonGroup,
  StyledRequestList,
  StyledRequestItem,
} from "./DevTools.styles";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface DevToolsProps {
  open: boolean;
  onClose: () => void;
}

interface RequestLog {
  id: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  requestTime: number;
  responseTime?: number;
  duration?: number;
  requestData?: unknown;
  responseData?: unknown;
  error?: string;
}

// 전역 requestMap - 여러 인스턴스 방지 및 메모리 누수 방지
const globalRequestMap = new Map<
  string,
  { startTime: number; method: string; url: string; data?: unknown }
>();

// 전역 모니터링 상태
let isMonitoring = false;
let originalFetch: typeof window.fetch | null = null;
const logCallbacks: Set<(log: RequestLog) => void> = new Set();
const errorCallbacks: Set<
  (error: { time: number; message: string; stack?: string }) => void
> = new Set();

const DevTools: React.FC<DevToolsProps> = ({ open, onClose }) => {
  const { openTabs, activeTabKey } = useUiStore();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<
    Array<{ time: number; message: string; stack?: string }>
  >([]);
  const [selectedStore, setSelectedStore] = useState<string>("uiStore");
  const [requestFilter, setRequestFilter] = useState<string>("");
  const requestLogsRef = useRef<RequestLog[]>([]);
  const errorLogsRef = useRef<
    Array<{ time: number; message: string; stack?: string }>
  >([]);

  // 네트워크 요청 모니터링 설정
  useEffect(() => {
    // 로그 콜백 등록/해제
    const handleLog = (log: RequestLog) => {
      requestLogsRef.current = [log, ...requestLogsRef.current].slice(0, 100);
      requestAnimationFrame(() => {
        setRequestLogs([...requestLogsRef.current]);
      });
    };

    const handleError = (error: {
      time: number;
      message: string;
      stack?: string;
    }) => {
      errorLogsRef.current = [error, ...errorLogsRef.current].slice(0, 50);
      requestAnimationFrame(() => {
        setErrorLogs([...errorLogsRef.current]);
      });
    };

    if (open) {
      logCallbacks.add(handleLog);
      errorCallbacks.add(handleError);

      // 모니터링이 시작되지 않았다면 시작
      if (!isMonitoring && !originalFetch) {
        originalFetch = window.fetch;

        window.fetch = async (...args) => {
          if (!originalFetch) {
            throw new Error("Original fetch is not available");
          }

          const [url, options = {}] = args;
          const method = (options.method || "GET").toUpperCase();
          const requestId = `${Date.now()}-${Math.random()}`;
          const startTime = Date.now();

          globalRequestMap.set(requestId, {
            startTime,
            method,
            url: typeof url === "string" ? url : url.toString(),
            data: options.body
              ? (() => {
                  try {
                    return JSON.parse(options.body as string);
                  } catch {
                    return options.body;
                  }
                })()
              : undefined,
          });

          try {
            const response = await originalFetch(...args);
            const endTime = Date.now();
            const duration = endTime - startTime;
            const clonedResponse = response.clone();

            // 응답 데이터 읽기
            let responseData: unknown;
            try {
              const contentType = response.headers.get("content-type");
              if (contentType?.includes("application/json")) {
                responseData = await clonedResponse.json();
              } else {
                responseData = await clonedResponse.text();
              }
            } catch {
              responseData = "응답 데이터를 읽을 수 없습니다.";
            }

            const requestInfo = globalRequestMap.get(requestId);
            if (requestInfo) {
              const log: RequestLog = {
                id: requestId,
                method: requestInfo.method,
                url: requestInfo.url,
                status: response.status,
                statusText: response.statusText,
                requestTime: requestInfo.startTime,
                responseTime: endTime,
                duration,
                requestData: requestInfo.data,
                responseData,
              };
              logCallbacks.forEach((callback) => callback(log));
              globalRequestMap.delete(requestId);
            }

            return response;
          } catch (error) {
            const endTime = Date.now();
            const requestInfo = globalRequestMap.get(requestId);
            if (requestInfo) {
              const log: RequestLog = {
                id: requestId,
                method: requestInfo.method,
                url: requestInfo.url,
                requestTime: requestInfo.startTime,
                responseTime: endTime,
                duration: endTime - requestInfo.startTime,
                requestData: requestInfo.data,
                error: error instanceof Error ? error.message : String(error),
              };
              logCallbacks.forEach((callback) => callback(log));
              globalRequestMap.delete(requestId);
            }
            throw error;
          }
        };

        // 전역 에러 핸들러
        const globalHandleError = (event: ErrorEvent) => {
          const errorLog = {
            time: Date.now(),
            message: event.message,
            stack: event.error?.stack,
          };
          errorCallbacks.forEach((callback) => callback(errorLog));
        };

        const globalHandleUnhandledRejection = (
          event: PromiseRejectionEvent
        ) => {
          const errorLog = {
            time: Date.now(),
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack,
          };
          errorCallbacks.forEach((callback) => callback(errorLog));
        };

        window.addEventListener("error", globalHandleError);
        window.addEventListener(
          "unhandledrejection",
          globalHandleUnhandledRejection
        );

        isMonitoring = true;
      }
    }

    return () => {
      logCallbacks.delete(handleLog);
      errorCallbacks.delete(handleError);

      // 모든 콜백이 제거되면 모니터링 중지
      if (
        logCallbacks.size === 0 &&
        errorCallbacks.size === 0 &&
        originalFetch
      ) {
        window.fetch = originalFetch;
        originalFetch = null;
        isMonitoring = false;
        globalRequestMap.clear();
      }
    };
  }, [open]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 성공 메시지는 필요시 추가
    });
  }, []);

  const formatJSON = useCallback((obj: unknown): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }, []);

  const clearRequestLogs = useCallback(() => {
    requestLogsRef.current = [];
    setRequestLogs([]);
  }, []);

  const clearErrorLogs = useCallback(() => {
    errorLogsRef.current = [];
    setErrorLogs([]);
  }, []);

  // 현재 페이지 정보 (React Router)
  const currentPageInfo = useMemo(() => {
    if (!open) return null;

    const searchParamsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      searchParamsObj[key] = value;
    });

    return {
      location: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        state: location.state,
        key: location.key,
      },
      params: params,
      searchParams: searchParamsObj,
      url: `${location.pathname}${location.search}${location.hash}`,
    };
  }, [open, location, params, searchParams]);

  // Zustand 스토어 상태 가져오기
  const getStoreState = useCallback((storeName: string) => {
    try {
      switch (storeName) {
        case "uiStore":
          return useUiStore.getState();
        case "authStore":
          return useAuthStore.getState();
        default:
          return null;
      }
    } catch (error) {
      console.error(`스토어 상태 가져오기 실패: ${storeName}`, error);
      return null;
    }
  }, []);

  // 현재 활성 탭 정보
  const activeTabInfo = useMemo(() => {
    if (!open || !activeTabKey) return null;
    const activeTab = openTabs.find((tab) => tab.path === activeTabKey);
    if (!activeTab) return null;
    return {
      path: activeTab.path,
      title: activeTab.meta?.title,
      meta: activeTab.meta,
      params: activeTab.meta?.params,
    };
  }, [open, openTabs, activeTabKey]);

  const storeState = useMemo(() => {
    if (!open) return null;
    return getStoreState(selectedStore);
  }, [selectedStore, open, getStoreState]);

  // 현재 탭과 관련된 스토어 상태 필터링
  const filteredStoreState = useMemo(() => {
    if (!storeState || !activeTabInfo || selectedStore !== "uiStore") {
      return storeState;
    }
    // uiStore의 경우 현재 활성 탭 정보만 필터링
    const uiState = storeState as ReturnType<typeof useUiStore.getState>;
    return {
      activeTabKey: uiState.activeTabKey,
      activeTab: activeTabInfo,
      openTabs: uiState.openTabs.filter((tab) => tab.path === activeTabKey),
    };
  }, [storeState, activeTabInfo, selectedStore, activeTabKey]);

  // 필터링된 요청 로그
  const filteredRequestLogs = useMemo(() => {
    if (!requestFilter) return requestLogs;
    const filter = requestFilter.toLowerCase();
    return requestLogs.filter(
      (log) =>
        log.url.toLowerCase().includes(filter) ||
        log.method.toLowerCase().includes(filter) ||
        String(log.status || "").includes(filter)
    );
  }, [requestLogs, requestFilter]);

  // 상태 코드에 따른 색상
  const getStatusColor = useCallback((status?: number) => {
    if (!status) return "default";
    if (status >= 200 && status < 300) return "success";
    if (status >= 300 && status < 400) return "warning";
    if (status >= 400) return "error";
    return "default";
  }, []);

  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: "page",
        label: "페이지 정보",
        children: (
          <>
            {currentPageInfo && (
              <StyledSection>
                <Title level={5}>현재 페이지 정보</Title>
                <Space
                  direction="vertical"
                  style={{ width: "100%", marginBottom: 12 }}
                >
                  <Text>
                    <Text strong>URL:</Text> {currentPageInfo.url}
                  </Text>
                  <Text>
                    <Text strong>Pathname:</Text>{" "}
                    {currentPageInfo.location.pathname}
                  </Text>
                  {currentPageInfo.location.search && (
                    <Text>
                      <Text strong>Query:</Text>{" "}
                      {currentPageInfo.location.search}
                    </Text>
                  )}
                  {Object.keys(currentPageInfo.params).length > 0 && (
                    <Text>
                      <Text strong>Params:</Text>{" "}
                      {formatJSON(currentPageInfo.params)}
                    </Text>
                  )}
                  {Object.keys(currentPageInfo.searchParams).length > 0 && (
                    <Text>
                      <Text strong>Search Params:</Text>{" "}
                      {formatJSON(currentPageInfo.searchParams)}
                    </Text>
                  )}
                </Space>
                <StyledCodeBlock>
                  <pre>{formatJSON(currentPageInfo)}</pre>
                </StyledCodeBlock>
                <StyledButtonGroup>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(formatJSON(currentPageInfo))}
                  >
                    복사
                  </Button>
                </StyledButtonGroup>
              </StyledSection>
            )}
          </>
        ),
      },
      {
        key: "network",
        label: (
          <Badge count={requestLogs.length} size="small">
            네트워크
          </Badge>
        ),
        children: (
          <StyledSection>
            <Space
              style={{ marginBottom: 16, width: "100%" }}
              direction="vertical"
            >
              <Space>
                <Title level={5} style={{ margin: 0 }}>
                  API 요청 로그 ({requestLogs.length})
                </Title>
                <Button
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={clearRequestLogs}
                >
                  초기화
                </Button>
              </Space>
              <Search
                placeholder="URL, Method, Status로 검색..."
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                style={{ width: "100%" }}
                allowClear
              />
            </Space>
            {filteredRequestLogs.length === 0 ? (
              <Paragraph type="secondary">요청 로그가 없습니다.</Paragraph>
            ) : (
              <StyledRequestList>
                {filteredRequestLogs.map((log) => (
                  <StyledRequestItem key={log.id}>
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="small"
                    >
                      <Space>
                        <Tag color={getStatusColor(log.status)}>
                          {log.method} {log.status || "Pending"}
                        </Tag>
                        <Text strong style={{ fontSize: 12 }}>
                          {log.url}
                        </Text>
                        {log.duration && (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {log.duration}ms
                          </Text>
                        )}
                      </Space>
                      {/*
                          requestData를 unknown으로 선언하였기에
                          ESLint에서 "log.requestData &&" 를 오류로 하여 빌드 실패하므로
                          아래처럼 명시적으로 풀어서 사용.

                          혹은 requestData를 any로 선언과
                          eslint-disable-next-line @typescript-eslint/no-explicit-any
                          주석 사용.
                        */}
                      {log.requestData !== undefined &&
                        log.requestData !== null && (
                          <details>
                            <summary
                              style={{ cursor: "pointer", fontSize: 11 }}
                            >
                              요청 데이터
                            </summary>
                            <StyledCodeBlock style={{ marginTop: 8 }}>
                              <pre style={{ fontSize: 10 }}>
                                {formatJSON(log.requestData)}
                              </pre>
                            </StyledCodeBlock>
                          </details>
                        )}
                      {/*
                          responseData를 unknown으로 선언하였기에
                          ESLint에서 "log.responseData &&" 를 오류로 하여 빌드 실패하므로
                          아래처럼 명시적으로 풀어서 사용.

                          혹은 responseData를 any로 선언과
                          eslint-disable-next-line @typescript-eslint/no-explicit-any
                          주석 사용.
                        */}
                      {log.responseData !== undefined &&
                        log.responseData !== null && (
                          <details>
                            <summary
                              style={{ cursor: "pointer", fontSize: 11 }}
                            >
                              응답 데이터
                            </summary>
                            <StyledCodeBlock style={{ marginTop: 8 }}>
                              <pre style={{ fontSize: 10 }}>
                                {formatJSON(log.responseData)}
                              </pre>
                            </StyledCodeBlock>
                          </details>
                        )}
                      {log.error && (
                        <Text type="danger" style={{ fontSize: 11 }}>
                          에러: {log.error}
                        </Text>
                      )}
                    </Space>
                  </StyledRequestItem>
                ))}
              </StyledRequestList>
            )}
          </StyledSection>
        ),
      },
      {
        key: "stores",
        label: "스토어 상태",
        children: (
          <StyledSection>
            <Space
              style={{ marginBottom: 16, width: "100%" }}
              direction="vertical"
            >
              <Title level={5} style={{ margin: 0 }}>
                Zustand 스토어 상태
              </Title>
              <Select
                value={selectedStore}
                onChange={setSelectedStore}
                style={{ width: 200 }}
                options={[
                  { label: "UI Store", value: "uiStore" },
                  { label: "Auth Store", value: "authStore" },
                ]}
              />
              {activeTabInfo && selectedStore === "uiStore" && (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    현재 활성 탭 정보
                  </Text>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ marginLeft: 8 }}
                  >
                    <Text>
                      <Text strong>Path:</Text> {activeTabInfo.path}
                    </Text>
                    {activeTabInfo.title && (
                      <Text>
                        <Text strong>Title:</Text> {activeTabInfo.title}
                      </Text>
                    )}
                    {activeTabInfo.params &&
                      Object.keys(activeTabInfo.params).length > 0 && (
                        <Text>
                          <Text strong>Params:</Text>{" "}
                          {formatJSON(activeTabInfo.params)}
                        </Text>
                      )}
                  </Space>
                </Space>
              )}
            </Space>
            {filteredStoreState ? (
              <>
                <StyledCodeBlock>
                  <pre>
                    {formatJSON(
                      selectedStore === "uiStore" && activeTabInfo
                        ? filteredStoreState
                        : storeState
                    )}
                  </pre>
                </StyledCodeBlock>
                <StyledButtonGroup>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() =>
                      copyToClipboard(
                        formatJSON(
                          selectedStore === "uiStore" && activeTabInfo
                            ? filteredStoreState
                            : storeState
                        )
                      )
                    }
                  >
                    복사
                  </Button>
                </StyledButtonGroup>
              </>
            ) : (
              <Paragraph type="secondary">
                스토어 상태를 가져올 수 없습니다.
              </Paragraph>
            )}
          </StyledSection>
        ),
      },
      {
        key: "errors",
        label: (
          <Badge count={errorLogs.length} size="small">
            에러
          </Badge>
        ),
        children: (
          <StyledSection>
            <Space style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}>
                에러 로그 ({errorLogs.length})
              </Title>
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={clearErrorLogs}
              >
                초기화
              </Button>
            </Space>
            {errorLogs.length === 0 ? (
              <Paragraph type="secondary">에러가 없습니다.</Paragraph>
            ) : (
              <StyledRequestList>
                {errorLogs.map((error, index) => (
                  <StyledRequestItem key={index}>
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="small"
                    >
                      <Text type="danger" strong>
                        {new Date(error.time).toLocaleTimeString()}
                      </Text>
                      <Text>{error.message}</Text>
                      {error.stack && (
                        <details>
                          <summary style={{ cursor: "pointer", fontSize: 11 }}>
                            스택 트레이스
                          </summary>
                          <StyledCodeBlock style={{ marginTop: 8 }}>
                            <pre
                              style={{ fontSize: 10, whiteSpace: "pre-wrap" }}
                            >
                              {error.stack}
                            </pre>
                          </StyledCodeBlock>
                        </details>
                      )}
                    </Space>
                  </StyledRequestItem>
                ))}
              </StyledRequestList>
            )}
          </StyledSection>
        ),
      },
    ],
    [
      currentPageInfo,
      requestLogs,
      filteredRequestLogs,
      requestFilter,
      errorLogs,
      selectedStore,
      storeState,
      filteredStoreState,
      activeTabInfo,
      formatJSON,
      copyToClipboard,
      clearRequestLogs,
      clearErrorLogs,
      getStatusColor,
    ]
  );

  return (
    <Modal
      title="개발자 도구"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <StyledDevToolsContent>
        <Tabs defaultActiveKey="page" items={tabItems} />
      </StyledDevToolsContent>
    </Modal>
  );
};

export default DevTools;
