import { Body, Controller, Get, Param, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { AbacGuard } from "src/common/guard/abac.guard";
import { AbacPermission } from "src/common/decorators/abac.decorator";
import { GoogleLoginDto } from "./dto/google-login.dto";
import type { Request } from "express";
import { getClientIp, getLocationFromIp } from "src/common/utils/location.util";

@Controller('/api/v1/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('/register')
    Register(
        @Body() dto: RegisterDto,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.Registation(
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post("google-login")
    async GoogleLogin(
        @Body() dto: GoogleLoginDto,
        @Req() req: Request,
    ) {
        const ipAddress = getClientIp(req);
        const userAgent = req.headers["user-agent"] || "";
        const location = await getLocationFromIp(req);

        return this.authService.GoogleLogin(
            dto,
            req.headers["x-device-id"]?.toString() || "",
            ipAddress,
            userAgent
        );
    }

    @Post('/verfiy-email/:token')
    VerifyEmail(
        @Param('token') token: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!token) {
            throw new UnauthorizedException("Invalid or missing token")
        }

        return this.authService.VerifyEmail(
            token,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/login')
    Login(
        @Body() dto: LoginDto,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.Login(
            dto,
            client.deviceId,
            client.ipAddress,
            client.userAgent
        );
    }

    @Post('/refresh-token')
    RefreshToken(
        @Body() dto: RefreshTokenDto
    ) {
        return this.authService.refreshToken(dto.refreshToken, dto.institutionId)
    }


    @Post('/logout')
    Logout(
        @Body() dto: RefreshTokenDto
    ) {
        return this.authService.logout(
            dto.refreshToken
        )
    }

    @Post('/forget-password')
    ForgetPassword(
        @Body() dto: ForgotPasswordDto,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        return this.authService.forgetPassword(
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/reset-password/:token')
    ResetPassword(
        @Body() dto: ResetPasswordDto,
        @Param('token') token: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!token) {
            throw new UnauthorizedException("Invalid or missing token")
        }

        return this.authService.resetPassword(
            token,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    // --------------------
    // Loged
    // --------------------


    @Get('/me')
    @UseGuards(JwtAuthGuard)
    Me() {
        return {
            success: true
        }
    }

    @Get('/abac-test')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission('ACCESS_TASKS')
    AbacTest() {
        return {
            success: true,
            message: "ABAC access granted"
        }
    }

    @Get('/resource')
    @UseGuards(JwtAuthGuard, AbacGuard)
    @AbacPermission('RESOURCE_READ')
    getResource() {
        return {
            success: true,
            message: 'Resource accessed'
        };
    }
}