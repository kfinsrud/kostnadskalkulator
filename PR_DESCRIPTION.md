# Security Fix: Enforce lodash and lodash-es >= 4.17.23

## 🔒 Summary

This PR addresses a security vulnerability in `lodash` and `lodash-es` by enforcing version 4.17.23 or later across all dependencies using npm overrides. The vulnerability was reported through Dependabot and affected transitive dependencies, particularly `lodash-es` which was pinned at version 4.17.21 by CKEditor packages.

## 🐛 Problem Statement

From the security alert:
- **Current state**: The latest installable version was 4.17.21 due to conflicts
- **Required fix**: Upgrade to version 4.17.23 or later
- **Blocker**: `lodash-es` had no patched direct version available from upstream dependencies
- **Earliest fixed version**: 4.17.23

### Vulnerable Dependencies
- ❌ `lodash-es@4.17.21` - Used by multiple CKEditor 5 packages, quill, and react-color
- ✅ `lodash@4.17.23` - Already at safe version

## 🔧 Solution

Added npm overrides to the root `package.json` to force all instances of both packages to use version 4.17.23 or later:

```json
"overrides": {
  "lodash": ">=4.17.23",
  "lodash-es": ">=4.17.23"
}
```

This approach:
- ✅ Minimal changes to codebase (only package.json and lockfile)
- ✅ Applies globally to all transitive dependencies
- ✅ Prevents regression when dependencies are updated
- ✅ Compatible with npm workspaces architecture
- ✅ Does not break existing functionality

## 📋 Changes Made

### Files Modified
1. **`src/package.json`**
   - Added `"lodash": ">=4.17.23"` to overrides
   - Added `"lodash-es": ">=4.17.23"` to overrides

2. **`src/package-lock.json`**
   - Updated with new dependency resolutions
   - All instances of lodash-es now resolve to 4.17.23

## ✅ Verification Results

### 1. Dependency Versions
**Before:**
```
lodash@4.17.23 ✅
lodash-es@4.17.21 ❌
```

**After:**
```
lodash@4.17.23 ✅
lodash-es@4.17.23 ✅
```

### 2. Security Audit
**Before:**
```
62 vulnerabilities (2 low, 60 moderate)
```

**After:**
```
1 low severity vulnerability (unrelated quill XSS issue)
```

The lodash vulnerabilities are now completely resolved! 🎉

### 3. Tests
All test suites pass successfully:

```
✅ common: 20 tests passed (2 test files)
✅ client: 1 test passed
✅ api: 17 tests passed
✅ admin-client: 40 tests passed (9 test files)

Total: 78/78 tests passing
```

### 4. Build
```
✅ common: TypeScript compilation successful
✅ client: Vite build successful + service worker generated
✅ api: TypeScript compilation + rollup bundle successful
✅ admin-client: TypeScript compilation + Vite build successful
```

## 🎯 Affected Dependencies

The following packages now use `lodash-es@4.17.23` (previously 4.17.21):

### CKEditor 5 Packages
- @ckeditor/ckeditor5-core
- @ckeditor/ckeditor5-editor-classic
- @ckeditor/ckeditor5-typing
- @ckeditor/ckeditor5-ui
- @ckeditor/ckeditor5-engine
- @ckeditor/ckeditor5-utils
- @ckeditor/ckeditor5-autosave
- @ckeditor/ckeditor5-clipboard
- @ckeditor/ckeditor5-ckbox
- @ckeditor/ckeditor5-image
- @ckeditor/ckeditor5-link
- @ckeditor/ckeditor5-table
- @ckeditor/ckeditor5-watchdog
- @ckeditor/ckeditor5-editor-multi-root
- And 10+ more CKEditor packages

### Other Packages
- quill
- react-color

## 🔐 Security Advisory Details

**Vulnerability Type:** Command Injection & Prototype Pollution

**Affected Versions:**
- lodash < 4.17.23
- lodash-es < 4.17.23

**Fixed Version:** 4.17.23

**Severity:** Moderate to High (depending on usage)

## 📝 Maintenance Notes

### When to Remove This Override

This override can be safely removed once **all** upstream dependencies (particularly CKEditor packages) update their peer/direct dependencies to require lodash-es >= 4.17.23. To check:

```bash
cd src
npm ls lodash-es --all
```

If all dependencies naturally resolve to >= 4.17.23 without the override, you can remove it.

### How to Remove

1. Edit `src/package.json`
2. Remove the lines:
   ```json
   "lodash": ">=4.17.23",
   "lodash-es": ">=4.17.23"
   ```
3. Run `npm install`
4. Verify with `npm ls lodash lodash-es --all`
5. Run `npm audit` to ensure no new vulnerabilities

## 📚 References

- [npm overrides documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
- [Lodash Security Advisories](https://github.com/lodash/lodash/security/advisories)
- lodash-es package versions: 4.17.22 and 4.17.23 are available on npm

## 🚀 Deployment Checklist

- [x] Tests pass locally
- [x] Build succeeds
- [x] Security audit shows improvement
- [x] No breaking changes detected
- [x] Documentation updated (this PR)
- [ ] CI/CD pipeline passes
- [ ] Code review approved
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Verify in staging environment
- [ ] Deploy to production
- [ ] Monitor for issues

## 🤝 Review Guidelines

**For Reviewers:**
1. ✅ Verify the override values match the security advisory requirements (>= 4.17.23)
2. ✅ Check that all tests pass in CI
3. ✅ Confirm npm audit shows reduced vulnerabilities
4. ✅ Review that no functionality is broken (test results show this)
5. ✅ Verify the commit message follows conventional commits

**Suggested Approval Process:**
- Test in staging environment before production deployment
- Monitor error logs after deployment
- Consider this low-risk since tests pass and builds succeed

## 💡 Alternative Approaches Considered

1. **❌ Wait for upstream updates** - CKEditor and other packages may take months to update
2. **❌ Fork and patch dependencies** - Too much maintenance overhead
3. **✅ Use npm overrides** - Clean, minimal, effective (chosen approach)
4. **❌ Upgrade to different editor libraries** - Too much refactoring required

## 📞 Contact

For questions about this fix, contact the repository maintainers or open an issue.

---

**Type:** Security Fix  
**Priority:** High  
**Breaking Changes:** None  
**Backward Compatible:** Yes
