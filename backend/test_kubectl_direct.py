"""Direct test of kubectl namespace listing."""
import subprocess
import json
import os

kubeconfig = os.path.expanduser("~/.kube/config")
cmd = ["kubectl", "get", "namespaces", "-o", "json", "--kubeconfig", kubeconfig]

print(f"Command: {' '.join(cmd)}")
print(f"Kubeconfig: {kubeconfig}")
print(f"Kubeconfig exists: {os.path.exists(kubeconfig)}")

result = subprocess.run(cmd, capture_output=True, text=True, shell=False, timeout=30)

print(f"\nReturn code: {result.returncode}")
if result.returncode != 0:
    print(f"Error: {result.stderr}")
else:
    try:
        data = json.loads(result.stdout)
        items = data.get("items", [])
        print(f"Found {len(items)} namespaces")
        ns_names = [ns.get("metadata", {}).get("name", "") for ns in items]
        print(f"Namespaces: {', '.join(ns_names[:10])}")
        
        # Filter out system namespaces
        filtered = [n for n in ns_names if n not in ["kube-system", "kube-public", "kube-node-lease", "default"]]
        print(f"\nFiltered (non-system): {len(filtered)} namespaces")
        print(f"Filtered namespaces: {', '.join(filtered[:10])}")
    except Exception as e:
        print(f"JSON parse error: {e}")
        print(f"Output: {result.stdout[:500]}")

