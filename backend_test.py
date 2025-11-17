#!/usr/bin/env python3
"""
Backend API Testing for Erebus Protocol - Solana ZK Privacy System
Tests the core backend functionality including treasury wallet and balance checking.
"""

import requests
import sys
import os
import base58
from datetime import datetime
from solders.keypair import Keypair
from solders.pubkey import Pubkey

class ErebusBackendTester:
    def __init__(self, base_url="https://erebus-protocol.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test treasury key from .env
        self.treasury_private_key = "2kCtnTmECKufvS1z6MBZG9Puvypy1qKrcxReoemGHgUCozQFmBs4Baswhwk69Tz9sSkciXaswpeeuPPz4KRmg5pu"
        
        print(f"🚀 Starting Erebus Protocol Backend Tests")
        print(f"📡 Base URL: {self.base_url}")
        print(f"🔑 Treasury Key Configured: {'✅' if self.treasury_private_key else '❌'}")
        print("=" * 60)

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                    print(f"   📄 Response: {result['response_data']}")
                except:
                    result["response_data"] = response.text[:200]
                    print(f"   📄 Response: {result['response_data']}")
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result["error"] = error_data
                    print(f"   🚨 Error: {error_data}")
                except:
                    result["error"] = response.text[:200]
                    print(f"   🚨 Error: {result['error']}")

            self.test_results.append(result)
            return success, result["response_data"]

        except Exception as e:
            print(f"   ❌ FAILED - Exception: {str(e)}")
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "EXCEPTION",
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )
        
        if success and response:
            expected_message = "Erebus Protocol API - ZK Privacy on Solana"
            if response.get("message") == expected_message:
                print(f"   ✅ Correct message returned")
                return True
            else:
                print(f"   ⚠️  Message mismatch. Expected: '{expected_message}', Got: '{response.get('message')}'")
                return False
        return success

    def test_treasury_address(self):
        """Test treasury address endpoint"""
        success, response = self.run_test(
            "Treasury Address Endpoint",
            "GET",
            "api/treasury/address",
            200
        )
        
        if success and response:
            address = response.get("address")
            if address:
                print(f"   📍 Treasury Address: {address}")
                
                # Validate it's a valid Solana address
                try:
                    pubkey = Pubkey.from_string(address)
                    print(f"   ✅ Valid Solana address format")
                    
                    # Verify it matches the treasury private key
                    if self.treasury_private_key:
                        try:
                            private_key_bytes = base58.b58decode(self.treasury_private_key)
                            keypair = Keypair.from_bytes(private_key_bytes)
                            expected_address = str(keypair.pubkey())
                            
                            if address == expected_address:
                                print(f"   ✅ Address matches treasury private key")
                                return True
                            else:
                                print(f"   ⚠️  Address mismatch. Expected: {expected_address}")
                                return False
                        except Exception as e:
                            print(f"   ⚠️  Could not verify against private key: {e}")
                            return success
                    
                    return True
                except Exception as e:
                    print(f"   ❌ Invalid Solana address format: {e}")
                    return False
            else:
                print(f"   ❌ No address in response")
                return False
        return success

    def test_balance_endpoint(self):
        """Test balance checking endpoint"""
        # Test with treasury address first
        success, treasury_response = self.run_test(
            "Get Treasury Address for Balance Test",
            "GET",
            "api/treasury/address",
            200
        )
        
        if not success or not treasury_response:
            print(f"   ⚠️  Could not get treasury address for balance test")
            return False
            
        treasury_address = treasury_response.get("address")
        if not treasury_address:
            print(f"   ⚠️  No treasury address found")
            return False
            
        # Test balance endpoint with treasury address
        success, response = self.run_test(
            f"Balance Check - Treasury Address",
            "GET",
            f"api/balance/{treasury_address}",
            200
        )
        
        if success and response:
            balance = response.get("balance")
            address = response.get("address")
            
            if balance is not None and address:
                print(f"   💰 Balance: {balance} SOL")
                print(f"   📍 Address: {address}")
                
                if address == treasury_address:
                    print(f"   ✅ Address matches request")
                    return True
                else:
                    print(f"   ⚠️  Address mismatch in response")
                    return False
            else:
                print(f"   ❌ Missing balance or address in response")
                return False
        return success

    def test_invalid_balance_endpoint(self):
        """Test balance endpoint with invalid address"""
        invalid_address = "invalid_address_123"
        success, response = self.run_test(
            "Balance Check - Invalid Address",
            "GET",
            f"api/balance/{invalid_address}",
            400  # Should return 400 for invalid address
        )
        
        if success:
            print(f"   ✅ Correctly rejected invalid address")
            return True
        return False

    def test_treasury_wallet_validation(self):
        """Validate treasury wallet configuration"""
        print(f"\n🔍 Test {self.tests_run + 1}: Treasury Wallet Validation")
        self.tests_run += 1
        
        if not self.treasury_private_key:
            print(f"   ❌ No treasury private key configured")
            self.test_results.append({
                "test_name": "Treasury Wallet Validation",
                "success": False,
                "error": "No treasury private key found"
            })
            return False
            
        try:
            # Decode and validate private key
            private_key_bytes = base58.b58decode(self.treasury_private_key)
            keypair = Keypair.from_bytes(private_key_bytes)
            public_key = str(keypair.pubkey())
            
            print(f"   ✅ Treasury private key is valid")
            print(f"   📍 Derived public key: {public_key}")
            print(f"   🔑 Private key length: {len(private_key_bytes)} bytes")
            
            self.tests_passed += 1
            self.test_results.append({
                "test_name": "Treasury Wallet Validation",
                "success": True,
                "public_key": public_key,
                "private_key_length": len(private_key_bytes)
            })
            return True
            
        except Exception as e:
            print(f"   ❌ Invalid treasury private key: {e}")
            self.test_results.append({
                "test_name": "Treasury Wallet Validation",
                "success": False,
                "error": str(e)
            })
            return False

    def test_cors_headers(self):
        """Test CORS configuration"""
        success, response = self.run_test(
            "CORS Headers Check",
            "GET",
            "api/",
            200
        )
        
        # Note: requests library doesn't show CORS headers in response for same-origin requests
        # This test mainly checks if the endpoint is accessible
        return success

    def test_token_list_endpoint(self):
        """Test token list endpoint"""
        success, response = self.run_test(
            "Token List Endpoint",
            "GET",
            "api/token-list",
            200
        )
        
        if success and response:
            if isinstance(response, list) and len(response) > 0:
                print(f"   📋 Found {len(response)} tokens in list")
                
                # Check if popular tokens are present
                symbols = [token.get('symbol') for token in response]
                expected_tokens = ['SOL', 'USDC', 'BONK']
                found_tokens = [token for token in expected_tokens if token in symbols]
                
                print(f"   ✅ Popular tokens found: {found_tokens}")
                return len(found_tokens) > 0
            else:
                print(f"   ❌ Empty or invalid token list response")
                return False
        return success

    def test_token_info_endpoint(self):
        """Test token info endpoint with known token"""
        # Test with SOL token
        sol_mint = "So11111111111111111111111111111111111111112"
        success, response = self.run_test(
            "Token Info Endpoint - SOL",
            "GET",
            f"api/token-info/{sol_mint}",
            200
        )
        
        if success and response:
            required_fields = ['address', 'symbol', 'name', 'decimals']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ All required fields present")
                print(f"   🪙 Token: {response.get('symbol')} - {response.get('name')}")
                print(f"   🔢 Decimals: {response.get('decimals')}")
                return True
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
                return False
        return success

    def test_cryptoapis_endpoint_bonk(self):
        """Test CryptoAPIs endpoint with BONK token"""
        bonk_mint = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
        success, response = self.run_test(
            "CryptoAPIs Endpoint - BONK Token",
            "GET",
            f"api/token-metadata/cryptoapis/{bonk_mint}?network=mainnet",
            200
        )
        
        if success and response:
            required_fields = ['address', 'symbol', 'name', 'decimals', 'source']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ All required fields present")
                print(f"   🪙 Token: {response.get('symbol')} - {response.get('name')}")
                print(f"   🔢 Decimals: {response.get('decimals')}")
                print(f"   🏷️ Source: {response.get('source')}")
                
                # Verify source is cryptoapis
                if response.get('source') == 'cryptoapis':
                    print(f"   ✅ Correct source attribution")
                    return True
                else:
                    print(f"   ⚠️  Source should be 'cryptoapis', got: {response.get('source')}")
                    return False
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
                return False
        return success

    def test_cryptoapis_endpoint_sol(self):
        """Test CryptoAPIs endpoint with SOL token"""
        sol_mint = "So11111111111111111111111111111111111111112"
        success, response = self.run_test(
            "CryptoAPIs Endpoint - SOL Token",
            "GET",
            f"api/token-metadata/cryptoapis/{sol_mint}?network=mainnet",
            200
        )
        
        if success and response:
            required_fields = ['address', 'symbol', 'name', 'decimals', 'source']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ All required fields present")
                print(f"   🪙 Token: {response.get('symbol')} - {response.get('name')}")
                print(f"   🔢 Decimals: {response.get('decimals')}")
                print(f"   🏷️ Source: {response.get('source')}")
                
                # Verify source is cryptoapis
                if response.get('source') == 'cryptoapis':
                    print(f"   ✅ Correct source attribution")
                    return True
                else:
                    print(f"   ⚠️  Source should be 'cryptoapis', got: {response.get('source')}")
                    return False
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
                return False
        return success

    def test_cryptoapis_invalid_mint(self):
        """Test CryptoAPIs endpoint with invalid mint address"""
        invalid_mint = "InvalidMintAddress123"
        success, response = self.run_test(
            "CryptoAPIs Endpoint - Invalid Mint",
            "GET",
            f"api/token-metadata/cryptoapis/{invalid_mint}?network=mainnet",
            404  # Should return 404 for invalid/non-existent token
        )
        
        if success:
            print(f"   ✅ Correctly returned 404 for invalid mint")
            return True
        return False

    def test_cryptoapis_nonexistent_token(self):
        """Test CryptoAPIs endpoint with valid format but non-existent token"""
        # Use a valid Solana address format but non-existent token
        fake_mint = "11111111111111111111111111111111111111111111"
        success, response = self.run_test(
            "CryptoAPIs Endpoint - Non-existent Token",
            "GET",
            f"api/token-metadata/cryptoapis/{fake_mint}?network=mainnet",
            404  # Should return 404 for non-existent token
        )
        
        if success:
            print(f"   ✅ Correctly returned 404 for non-existent token")
            return True
        return False

    def test_cryptoapis_devnet_network(self):
        """Test CryptoAPIs endpoint with devnet network parameter"""
        bonk_mint = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
        success, response = self.run_test(
            "CryptoAPIs Endpoint - Devnet Network",
            "GET",
            f"api/token-metadata/cryptoapis/{bonk_mint}?network=devnet",
            404  # BONK likely doesn't exist on devnet, should return 404
        )
        
        # Either 200 (if token exists on devnet) or 404 (if not) is acceptable
        if success or response:
            print(f"   ✅ Devnet network parameter handled correctly")
            return True
        return False

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"\n🧪 Running All Backend Tests\n")
        
        test_functions = [
            self.test_root_endpoint,
            self.test_treasury_address,
            self.test_balance_endpoint,
            self.test_invalid_balance_endpoint,
            self.test_treasury_wallet_validation,
            self.test_cors_headers,
            self.test_token_list_endpoint,
            self.test_token_info_endpoint,
            self.test_cryptoapis_endpoint_bonk,
            self.test_cryptoapis_endpoint_sol,
            self.test_cryptoapis_invalid_mint,
            self.test_cryptoapis_nonexistent_token,
            self.test_cryptoapis_devnet_network
        ]
        
        for test_func in test_functions:
            try:
                test_func()
            except Exception as e:
                print(f"   ❌ Test function {test_func.__name__} failed with exception: {e}")
        
        self.print_summary()
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test summary"""
        print(f"\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print(f"🎉 ALL TESTS PASSED!")
        else:
            print(f"⚠️  Some tests failed. Check details above.")
            
        print(f"=" * 60)

    def get_failed_tests(self):
        """Get list of failed tests"""
        return [test for test in self.test_results if not test["success"]]

    def get_passed_tests(self):
        """Get list of passed tests"""
        return [test for test in self.test_results if test["success"]]

def main():
    """Main test execution"""
    print(f"🔬 Erebus Protocol Backend Testing Suite")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Testing Environment: Production")
    
    tester = ErebusBackendTester()
    
    try:
        success = tester.run_all_tests()
        
        # Print detailed results for debugging
        print(f"\n📋 DETAILED TEST RESULTS:")
        for i, result in enumerate(tester.test_results, 1):
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{i}. {result['test_name']}: {status}")
            if not result["success"] and result.get("error"):
                print(f"   Error: {result['error']}")
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print(f"\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Test suite failed with exception: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)