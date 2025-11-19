#!/usr/bin/env python3
"""
Test script to find the correct way to get namespaces from kubectl
"""
import subprocess
import os
import sys

print("=" * 80)
print("Testing kubectl namespace retrieval")
print("=" * 80)

# Set up environment
kubeconfig_path = os.path.expanduser("~/.kube/config")
env = os.environ.copy()
env["KUBECONFIG"] = kubeconfig_path

# Find kubectl
kubectl_path = None
for path in [
    r"C:\Program Files\Rancher Desktop\resources\resources\win32\bin\kubectl.EXE",
    "kubectl",
    "kubectl.exe"
]:
    if os.path.exists(path) if os.path.sep in path else True:
        result = subprocess.run([path, "version", "--client"], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            kubectl_path = path
            print(f"✓ Found kubectl: {kubectl_path}")
            break

if not kubectl_path:
    print("✗ kubectl not found!")
    sys.exit(1)

# Test 1: Simple command with shell=True
print("\n" + "=" * 80)
print("Test 1: Simple command with shell=True")
print("=" * 80)
cmd1 = f'"{kubectl_path}" get namespaces'
print(f"Command: {cmd1}")
result1 = subprocess.run(cmd1, shell=True, capture_output=True, text=True, env=env, timeout=10)
print(f"Return code: {result1.returncode}")
if result1.returncode == 0:
    print(f"✓ SUCCESS!")
    print(f"Output (first 500 chars):\n{result1.stdout[:500]}")
    # Parse namespaces
    lines = [l.strip() for l in result1.stdout.strip().split('\n') if l.strip()]
    if len(lines) > 1:
        namespaces = []
        system_ns = {"kube-system", "kube-public", "kube-node-lease", "default"}
        for line in lines[1:]:
            parts = line.split()
            if len(parts) > 0:
                ns = parts[0].strip()
                if ns and ns not in system_ns:
                    namespaces.append(ns)
        print(f"\n✓ Found {len(namespaces)} namespaces: {namespaces}")
else:
    print(f"✗ FAILED")
    print(f"Stderr: {result1.stderr[:500]}")

# Test 2: Using list format
print("\n" + "=" * 80)
print("Test 2: Using list format (no shell)")
print("=" * 80)
cmd2 = [kubectl_path, "get", "namespaces"]
print(f"Command: {cmd2}")
result2 = subprocess.run(cmd2, capture_output=True, text=True, env=env, timeout=10, shell=False)
print(f"Return code: {result2.returncode}")
if result2.returncode == 0:
    print(f"✓ SUCCESS!")
    print(f"Output (first 500 chars):\n{result2.stdout[:500]}")
    # Parse namespaces
    lines = [l.strip() for l in result2.stdout.strip().split('\n') if l.strip()]
    if len(lines) > 1:
        namespaces = []
        system_ns = {"kube-system", "kube-public", "kube-node-lease", "default"}
        for line in lines[1:]:
            parts = line.split()
            if len(parts) > 0:
                ns = parts[0].strip()
                if ns and ns not in system_ns:
                    namespaces.append(ns)
        print(f"\n✓ Found {len(namespaces)} namespaces: {namespaces}")
else:
    print(f"✗ FAILED")
    print(f"Stderr: {result2.stderr[:500]}")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)

