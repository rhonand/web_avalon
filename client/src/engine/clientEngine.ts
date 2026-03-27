export function createNetworkEnginePlaceholder() {
  return {
    status: "pending_server_integration" as const,
  };
}
